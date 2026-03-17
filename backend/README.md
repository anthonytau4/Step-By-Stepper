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
