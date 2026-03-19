"""
FastAPI proxy + PDF parser for Step By Stepper.
Proxies all requests to the Node.js Express backend (on port 3001)
and adds new endpoints like /api/pdf/parse.
"""
import os
import subprocess
import signal
import asyncio
import tempfile
import json
import re
from contextlib import asynccontextmanager

import httpx
import pdfplumber
from fastapi import FastAPI, Request, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse, Response
from fastapi.middleware.cors import CORSMiddleware

NODE_PORT = 3001
NODE_BASE = f"http://127.0.0.1:{NODE_PORT}"
node_process = None


@asynccontextmanager
async def lifespan(application: FastAPI):
    global node_process
    env = {**os.environ, "PORT": str(NODE_PORT)}
    node_process = subprocess.Popen(
        ["node", "server.mjs"],
        cwd=os.path.dirname(os.path.abspath(__file__)),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    # Wait briefly for Node to start
    await asyncio.sleep(2)
    yield
    if node_process and node_process.poll() is None:
        node_process.send_signal(signal.SIGTERM)
        try:
            node_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            node_process.kill()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def parse_pdf_to_steps(pdf_path: str) -> dict:
    """
    Parse a PDF stepsheet and extract dance metadata and steps.
    Returns structured data for the editor.
    """
    full_text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"

    if not full_text.strip():
        return {"error": "Could not extract any text from the PDF."}

    lines = [line.strip() for line in full_text.split("\n") if line.strip()]

    # Try to extract metadata
    title = ""
    choreographer = ""
    music = ""
    count = ""
    level = ""
    wall = ""
    steps = []

    metadata_done = False
    step_lines = []

    for line in lines:
        lower = line.lower()

        # Detect metadata lines
        if not metadata_done:
            if not title and (
                lower.startswith("dance:") or lower.startswith("dance name:")
            ):
                title = line.split(":", 1)[1].strip()
                continue
            if not choreographer and (
                lower.startswith("choreographer:")
                or lower.startswith("choreo:")
                or lower.startswith("by:")
            ):
                choreographer = line.split(":", 1)[1].strip()
                continue
            if not music and (
                lower.startswith("music:")
                or lower.startswith("song:")
                or lower.startswith("track:")
            ):
                music = line.split(":", 1)[1].strip()
                continue
            if not count and (
                lower.startswith("count:")
                or lower.startswith("counts:")
                or lower.startswith("total counts:")
            ):
                count = line.split(":", 1)[1].strip()
                continue
            if not level and (
                lower.startswith("level:")
                or lower.startswith("difficulty:")
            ):
                level = line.split(":", 1)[1].strip()
                continue
            if not wall and lower.startswith("wall:"):
                wall = line.split(":", 1)[1].strip()
                continue

        # Check for section headers like "Section 1:" or "[1-8]" or "Counts 1-8"
        section_match = re.match(
            r"^(?:section\s*\d+)\s*[:\-]?\s*(.*)",
            line,
            re.IGNORECASE,
        )
        if section_match:
            metadata_done = True
            rest = section_match.group(1).strip()
            if rest:
                step_lines.append(rest)
            continue

        # Once we've seen metadata, treat remaining lines as steps
        if metadata_done or (
            not title
            and not choreographer
            and len(step_lines) == 0
            and any(
                kw in lower
                for kw in [
                    "step",
                    "touch",
                    "turn",
                    "kick",
                    "slide",
                    "cross",
                    "rock",
                    "shuffle",
                    "vine",
                    "grapevine",
                    "coaster",
                    "pivot",
                    "jazz",
                    "heel",
                    "toe",
                    "stomp",
                    "hitch",
                    "weave",
                    "sailor",
                    "scuff",
                    "hold",
                    "clap",
                    "sway",
                    "bump",
                    "flick",
                    "hook",
                    "brush",
                    "drag",
                    "lock",
                    "anchor",
                    "monterey",
                    "mambo",
                    "cha",
                    "rumba",
                    "waltz",
                ]
            )
        ):
            metadata_done = True
            step_lines.append(line)
            continue

        # If we haven't found metadata yet and it looks like a title (first line)
        if not title and not metadata_done and len(step_lines) == 0:
            title = line
            continue

        step_lines.append(line)

    # Parse step lines into structured steps
    for line in step_lines:
        # Try to parse count and description from patterns like "1-2 Step forward right"
        count_match = re.match(
            r"^[&]?(\d+(?:\s*[&,+]\s*\d+)*(?:\s*[-–]\s*\d+)?)\s*[:\.\-\)]*\s+(.*)",
            line,
        )
        if count_match:
            step_count = count_match.group(1).strip()
            step_desc = count_match.group(2).strip()
            # Try to detect foot
            foot = "Either"
            lower_desc = step_desc.lower()
            if (
                "right" in lower_desc
                and "left" not in lower_desc
            ):
                foot = "Right"
            elif (
                "left" in lower_desc
                and "right" not in lower_desc
            ):
                foot = "Left"

            steps.append(
                {
                    "name": step_desc.split(",")[0].strip()[:80] if step_desc else line[:80],
                    "description": step_desc,
                    "counts": step_count,
                    "foot": foot,
                }
            )
        else:
            # No count prefix, just use the line as a step
            foot = "Either"
            lower_line = line.lower()
            if "right" in lower_line and "left" not in lower_line:
                foot = "Right"
            elif "left" in lower_line and "right" not in lower_line:
                foot = "Left"

            steps.append(
                {
                    "name": line[:80],
                    "description": line,
                    "counts": "1",
                    "foot": foot,
                }
            )

    return {
        "title": title,
        "choreographer": choreographer,
        "music": music,
        "count": count,
        "level": level,
        "wall": wall,
        "steps": steps,
        "rawText": full_text.strip(),
    }


@app.get("/health")
@app.get("/healthz")
async def health_check():
    return JSONResponse({"status": "healthy"})


@app.post("/api/pdf/parse")
async def parse_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="PDF too large (max 10MB).")

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        result = parse_pdf_to_steps(tmp_path)
        if "error" in result:
            raise HTTPException(status_code=422, detail=result["error"])
        return JSONResponse({"ok": True, **result})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF parsing failed: {str(e)}")
    finally:
        os.unlink(tmp_path)


@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
)
async def proxy_to_node(request: Request, path: str):
    """Proxy all /api/* requests to the Node.js backend."""
    url = f"{NODE_BASE}/api/{path}"
    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("Host", None)

    body = await request.body()
    params = dict(request.query_params)

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                params=params,
            )
            excluded = {"transfer-encoding", "content-encoding", "content-length"}
            resp_headers = {
                k: v
                for k, v in resp.headers.items()
                if k.lower() not in excluded
            }
            return Response(
                content=resp.content,
                status_code=resp.status_code,
                headers=resp_headers,
            )
        except httpx.ConnectError:
            return JSONResponse(
                {"ok": False, "error": "Backend Node.js server is not responding."},
                status_code=502,
            )
        except Exception as e:
            return JSONResponse(
                {"ok": False, "error": str(e)},
                status_code=502,
            )
