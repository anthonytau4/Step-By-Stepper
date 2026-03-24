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
