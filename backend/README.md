# Backend notes

This backend now stores:
- Google-auth cloud saves
- dance registry items
- pending feature/upload submissions
- per-user notifications for approvals/rejections/features

Key env vars:
- GOOGLE_CLIENT_ID
- ADMIN_EMAIL
- ALLOWED_ORIGIN
- OPENAI_API_KEY (optional, used for AI-generated feature badge labels)


## Premium subscriptions

Set `STRIPE_SECRET_KEY` on the backend and optionally `STRIPE_PUBLISHABLE_KEY`. Premium plans are hard-coded to NZ$12.50 monthly and NZ$100 yearly. The AI site helper is premium-only; the admin account is treated as premium automatically.


Use `https://step-by-stepper.onrender.com` as the default backend base in the frontend build unless you move the API to another hostname.

## Render install note

This project uses a Node backend that also shells out to Python for PDF parsing.
To make PDF imports work on Render, make sure the deploy build command installs both Node and Python dependencies.

Recommended backend build command:

`npm install --prefix backend && python3 -m pip install -r requirements.txt`

Recommended backend start command:

`npm start --prefix backend`

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

## Separate Python PDF parser service

If you would rather split PDF parsing into its own Render service, this repo now includes a `pdf-parser/` folder.

### Main Node backend Render service

If the Node service root is `backend/`:

**Build Command**
```bash
npm install
```

**Start Command**
```bash
npm start
```

Add this environment variable to the Node service:

```text
PDF_PARSER_URL=https://your-python-service.onrender.com
```

### Python Render service

Set the service root to `pdf-parser/`.

**Build Command**
```bash
pip install -r requirements.txt
```

**Start Command**
```bash
./render-start.sh
```

The Python service exposes:
- `GET /health`
- `POST /parse`

When `PDF_PARSER_URL` exists, `backend/server.mjs` will call the Python service for PDF text extraction instead of spawning local Python.


## Controlled Python worksheet builder

The site helper can now use a controlled Python worker for dance-building requests.
This is for structured worksheet edits only — not arbitrary shell access.

New endpoint:
- `POST /api/ai/worksheet-builder`

What it does:
- reads the helper prompt plus the current worksheet snapshot
- follows up when name/counts/walls/steps are missing
- returns structured worksheet changes such as meta updates and step inserts
- writes descriptions for custom steps when they are not in the glossary

### Deploying it on Render with Python enabled

If you want the helper to use the Python worker reliably, run the backend through the FastAPI wrapper in `backend/server.py`.
That wrapper starts the Node API as a subprocess and keeps Python available for the worksheet builder and PDF tools.

Suggested Render backend service root: `backend/`

**Build Command**
```bash
npm install && python3 -m pip install -r requirements.txt
```

**Start Command**
```bash
./render-start.sh
```

Optional environment variables:
- `PYTHON_BIN=python3`
- `AI_STEP_HELPER_URL=` if you later move the worksheet builder to a separate Python service
