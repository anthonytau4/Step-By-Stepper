# PDF Parser Render Service

This is the separate Python PDF parser service for Step-By-Stepper.

## Render settings

If the Render service root is `pdf-parser/`:

### Build Command

```bash
pip install -r requirements.txt
```

### Start Command

```bash
./render-start.sh
```

## Health endpoint

- `GET /health`

## Parse endpoint

- `POST /parse`
- multipart form field name: `file`

## Node backend setting

In the main Node backend Render service, add:

```text
PDF_PARSER_URL=https://your-python-service.onrender.com
```

When `PDF_PARSER_URL` is present, `backend/server.mjs` will send the uploaded PDF to this Python service instead of trying to run local `python3`.
