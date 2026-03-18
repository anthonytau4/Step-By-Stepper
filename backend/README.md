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
- OPENAI_API_KEY (optional, used for helper + badge AI)
- GEMINI_API_KEY (optional, helper fallback via Gemini 2.5 Flash)
- GEMINI_MODEL (optional, defaults to gemini-2.5-flash)


## Premium subscriptions

Set `STRIPE_SECRET_KEY` on the backend and optionally `STRIPE_PUBLISHABLE_KEY`. Premium plans are hard-coded to NZ$12.50 monthly and NZ$100 yearly. The AI site helper is premium-only; the admin account is treated as premium automatically.


Use `https://step-by-stepper.onrender.com` as the default backend base in the frontend build unless you move the API to another hostname.


The premium site helper now tries OpenAI first and Gemini 2.5 Flash as a backend fallback, while also feeding the helper current site context such as the active tab, current dance summary, featured choreo sample, queue counts, and moderator rules.
