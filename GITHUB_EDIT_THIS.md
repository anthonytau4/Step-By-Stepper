# Step-By-Stepper: what to edit in GitHub now

## 1) Commit these backend files
Add the whole `backend` folder, including:
- `backend/server.mjs`
- `backend/package.json`
- `backend/.env.example`
- `backend/.gitignore`
- `backend/data/stepper-db.json`
- `backend/README.md`

## 2) Edit the front end API base if your backend domain is different
At the top of `index.html` the app now uses:

```html
<script>
  window.STEPPER_API_BASE = window.STEPPER_API_BASE || (
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://localhost:3000"
      : "https://api.step-by-stepper.com"
  );
</script>
```

If your Render domain is different, change `https://api.step-by-stepper.com` to your real backend domain.

## 3) Set Render environment variables
Add these in Render:

```text
ALLOWED_ORIGIN=https://www.YOURDOMAIN.com,http://localhost:5173,http://127.0.0.1:5500
GOOGLE_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5
DATA_DIR=./data
```

## 4) Google Cloud setup you still need
Create a **Web application** OAuth client in Google Cloud and add your live frontend plus localhost to the **Authorised JavaScript origins**.

Typical origins:
- `https://www.YOURDOMAIN.com`
- `http://localhost:5173`
- `http://127.0.0.1:5500`

Then copy the Google **client ID** into Render as `GOOGLE_CLIENT_ID`.

## 5) Persistent storage note for Render
The new cloud-saves backend writes to `backend/data/stepper-db.json`.
On Render that file will reset unless you mount a **persistent disk** and point `DATA_DIR` at it.

## 6) Local run
From the `backend` folder:

```bash
npm install
npm run dev
```

Then open:
- `http://localhost:3000/api/health`
- `http://localhost:3000/api/auth/config`

## 7) What the front end now expects
The app will now try to:
- load backend auth config
- show a real Google sign-in button in **My Saved Dances**
- verify the Google ID token on the backend
- read and write cloud saves through backend routes
- fall back to the device-only shelf if the backend or Google config is missing
