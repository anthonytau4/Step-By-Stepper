# Google setup

Set GOOGLE_CLIENT_ID on the backend service in Render. The sign-in page now assumes Google is the default path and does not show manual connection controls.

Optional: set OPENAI_API_KEY if you want AI-generated feature badge labels when the admin features a dance. Without it, the app falls back to Bronze Feature / Silver Feature / Gold Feature.


Optional helper AI env vars on the backend:
- OPENAI_API_KEY
- GEMINI_API_KEY
- GEMINI_MODEL=gemini-2.5-flash
