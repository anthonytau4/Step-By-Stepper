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
import re
from contextlib import asynccontextmanager

import httpx
import pdfplumber
from fastapi import FastAPI, Request, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware

NODE_PORT = 3001
NODE_BASE = f"http://127.0.0.1:{NODE_PORT}"
node_process = None

# Persistent HTTP client for connection pooling
_http_client = None


def get_client():
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(
            timeout=60.0,
            limits=httpx.Limits(max_connections=50, max_keepalive_connections=20),
        )
    return _http_client


@asynccontextmanager
async def lifespan(application: FastAPI):
    global node_process, _http_client
    env = {**os.environ, "PORT": str(NODE_PORT)}
    # Load env vars from .env file
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
    for key in ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY"]:
        val = os.environ.get(key, "")
        if val:
            env[key] = val
    node_process = subprocess.Popen(
        ["node", "server.mjs"],
        cwd=os.path.dirname(os.path.abspath(__file__)),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    # Wait for Node to start
    for _ in range(20):
        await asyncio.sleep(0.5)
        try:
            async with httpx.AsyncClient(timeout=2.0) as c:
                r = await c.get(f"{NODE_BASE}/api/health")
                if r.status_code == 200:
                    break
        except Exception:
            pass
    yield
    if _http_client and not _http_client.is_closed:
        await _http_client.aclose()
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


@app.get("/health")
@app.get("/healthz")
async def health_check():
    return JSONResponse({"status": "healthy"})


# --- PDF Parsing ---

def parse_pdf_to_steps(pdf_path: str) -> dict:
    full_text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"

    if not full_text.strip():
        return {"error": "Could not extract any text from the PDF."}

    lines = [line.strip() for line in full_text.split("\n") if line.strip()]

    title = ""
    choreographer = ""
    music = ""
    count = ""
    level = ""
    wall = ""
    metadata_done = False
    step_lines = []

    for line in lines:
        lower = line.lower()

        if not metadata_done:
            if not title and (lower.startswith("dance:") or lower.startswith("dance name:")):
                title = line.split(":", 1)[1].strip(); continue
            if not choreographer and (lower.startswith("choreographer:") or lower.startswith("choreo:") or lower.startswith("by:")):
                choreographer = line.split(":", 1)[1].strip(); continue
            if not music and (lower.startswith("music:") or lower.startswith("song:") or lower.startswith("track:")):
                music = line.split(":", 1)[1].strip(); continue
            if not count and (lower.startswith("count:") or lower.startswith("counts:") or lower.startswith("total counts:")):
                count = line.split(":", 1)[1].strip(); continue
            if not level and (lower.startswith("level:") or lower.startswith("difficulty:")):
                level = line.split(":", 1)[1].strip(); continue
            if not wall and lower.startswith("wall:"):
                wall = line.split(":", 1)[1].strip(); continue

        section_match = re.match(r"^(?:section\s*\d+)\s*[:\-]?\s*(.*)", line, re.IGNORECASE)
        if section_match:
            metadata_done = True
            rest = section_match.group(1).strip()
            if rest:
                step_lines.append(rest)
            continue

        DANCE_KW = ["step", "touch", "turn", "kick", "slide", "cross", "rock", "shuffle", "vine",
                     "grapevine", "coaster", "pivot", "jazz", "heel", "toe", "stomp", "hitch",
                     "weave", "sailor", "scuff", "hold", "clap", "sway", "bump", "flick",
                     "hook", "brush", "drag", "lock", "anchor", "monterey", "mambo", "cha",
                     "rumba", "waltz"]

        if metadata_done or (not title and not choreographer and len(step_lines) == 0 and any(kw in lower for kw in DANCE_KW)):
            metadata_done = True
            step_lines.append(line)
            continue

        if not title and not metadata_done and len(step_lines) == 0:
            title = line
            continue

        step_lines.append(line)

    steps = []
    for line in step_lines:
        count_match = re.match(r"^[&]?(\d+(?:\s*[&,+]\s*\d+)*(?:\s*[-\u2013]\s*\d+)?)\s*[:\.\-\)]*\s+(.*)", line)
        if count_match:
            sc = count_match.group(1).strip()
            sd = count_match.group(2).strip()
            foot = detect_foot(sd)
            steps.append({"name": sd.split(",")[0].strip()[:80] if sd else line[:80], "description": sd, "counts": sc, "foot": foot})
        else:
            foot = detect_foot(line)
            steps.append({"name": line[:80], "description": line, "counts": "1", "foot": foot})

    return {"title": title, "choreographer": choreographer, "music": music, "count": count, "level": level, "wall": wall, "steps": steps, "rawText": full_text.strip()}


def detect_foot(text: str) -> str:
    lower = text.lower()
    has_right = "right" in lower
    has_left = "left" in lower
    if has_right and not has_left:
        return "Right"
    if has_left and not has_right:
        return "Left"
    return "Either"


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


# --- Proxy to Node.js ---

@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
)
async def proxy_to_node(request: Request, path: str):
    url = f"{NODE_BASE}/api/{path}"
    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("Host", None)

    body = await request.body()
    params = dict(request.query_params)

    client = get_client()

    # Retry once on connection error
    for attempt in range(2):
        try:
            resp = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                params=params,
            )
            excluded = {"transfer-encoding", "content-encoding", "content-length"}
            resp_headers = {k: v for k, v in resp.headers.items() if k.lower() not in excluded}
            return Response(content=resp.content, status_code=resp.status_code, headers=resp_headers)
        except (httpx.ConnectError, httpx.ReadTimeout):
            if attempt == 0:
                await asyncio.sleep(0.5)
                continue
            return JSONResponse({"ok": False, "error": "Backend Node.js server is not responding."}, status_code=502)
        except Exception as e:
            return JSONResponse({"ok": False, "error": str(e)}, status_code=502)
