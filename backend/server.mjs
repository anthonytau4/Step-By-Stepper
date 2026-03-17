import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
const model = process.env.OPENAI_MODEL || "gpt-5";

if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in backend environment.");
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors({ origin: allowedOrigin === "*" ? true : allowedOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "step-by-stepper-backend" });
});

app.post("/api/openai/respond", async (req, res) => {
  try {
    const prompt = String(req.body?.prompt || "").trim();
    const system = String(req.body?.system || "You are Step-By-Stepper assistant logic.").trim();

    if (!prompt) {
      return res.status(400).json({ ok: false, error: "Missing prompt." });
    }

    const response = await client.responses.create({
      model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: system }]
        },
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }]
        }
      ]
    });

    res.json({
      ok: true,
      text: response.output_text,
      raw: response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: error?.message || "Backend request failed."
    });
  }
});

app.listen(port, () => {
  console.log(`Step-By-Stepper backend running on http://localhost:${port}`);
});
