# Step-By-Stepper backend

## What this backend now does
- `/api/health` heartbeat route
- `/api/auth/config` exposes whether Google sign-in is configured
- `/api/auth/google` verifies a Google ID token on the backend
- `/api/auth/me` verifies a stored Google session token
- `/api/cloud-saves` reads signed-in cloud saves
- `/api/cloud-saves/upsert` writes signed-in cloud saves
- `/api/cloud-saves/:id` deletes signed-in cloud saves
- `/api/openai/respond` stays optional and only runs if `OPENAI_API_KEY` is set

## Local run
```bash
npm install
npm run dev
```

## Render env vars
- `ALLOWED_ORIGIN`
- `GOOGLE_CLIENT_ID`
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (optional)
- `DATA_DIR` (optional, set this to a persistent disk mount if you want cloud saves to survive redeploys)

## Important
This backend stores cloud saves in a JSON file. On Render, that means you should mount a persistent disk and point `DATA_DIR` at it if you want the cloud shelf to survive redeploys and restarts.
