# Step-By-Stepper backend

## What this backend now does
- `/api/health` heartbeat route
- `/api/auth/config` exposes whether Google sign-in is configured
- `/api/auth/google` verifies a Google ID token on the backend
- `/api/auth/me` verifies a stored Google session token
- `/api/presence` returns how many signed-in members are online right now
- `/api/presence/ping` marks the signed-in member as online
- `/api/cloud-saves` reads signed-in cloud saves
- `/api/cloud-saves/upsert` writes signed-in cloud saves
- `/api/cloud-saves/:id` deletes signed-in cloud saves
- `/api/featured-choreo` returns the featured list for the public tab
- `/api/admin/dances` lists every synced dance for the admin account
- `/api/admin/feature` features or unfeatures a dance with Bronze / Silver / Gold badges
- `/api/openai/respond` stays optional and only runs if `OPENAI_API_KEY` is set

## Local run
```bash
npm install
npm run dev
```

## Render env vars
- `ALLOWED_ORIGIN`
- `GOOGLE_CLIENT_ID`
- `ADMIN_EMAIL`
- `ONLINE_WINDOW_MS` (optional)
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (optional)
- `DATA_DIR` (optional, set this to a persistent disk mount if you want cloud saves, featured dances, and online presence data to survive redeploys)

## Important
This backend stores cloud saves, featured dances, and presence data in a JSON file. On Render, that means you should mount a persistent disk and point `DATA_DIR` at it if you want the data to survive redeploys and restarts.
