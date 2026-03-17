# Google auth setup for Step-By-Stepper

This build now includes:
- a real **Sign In** tab
- live **members online** count
- automatic backend syncing of signed-in dances
- an **Admin** tab that only shows for `Anthonytau4@gmail.com`
- Bronze / Silver / Gold featuring from the admin list

## What you need from Google
For sign-in, you need a **Google OAuth 2.0 Client ID** for a **Web application**.
This is **not** a Gemini key and **not** an OpenAI key.

## 1) Make the Google OAuth client
1. Open Google Cloud Console.
2. Pick or create a project.
3. Go to **APIs & Services → OAuth consent screen**.
4. Fill in the app name and basic details.
5. Go to **APIs & Services → Credentials**.
6. Click **Create Credentials → OAuth client ID**.
7. Choose **Web application**.

## 2) Add authorised JavaScript origins
Add the exact frontend origins you will use, for example:
- `https://step-by-stepper.com`
- `https://www.step-by-stepper.com`
- `http://localhost:3000`
- `http://127.0.0.1:5500`

Use your real domain here. Do not guess.

## 3) Copy the Client ID
When Google shows the new credential, copy the **Client ID**.
It looks something like:

`1234567890-abcdefg123456.apps.googleusercontent.com`

## 4) Put it in Render
In your Render backend service, add these environment variables:

- `GOOGLE_CLIENT_ID=your_client_id_here`
- `ADMIN_EMAIL=Anthonytau4@gmail.com`
- `ALLOWED_ORIGIN=https://your-frontend-domain.com`
- `ONLINE_WINDOW_MS=120000` (optional)

If you are also using OpenAI on the backend, keep that separate:
- `OPENAI_API_KEY=...`

## 5) Point the site at the backend
You can do this in either of two ways:

### Option A — hard-code it in the site
```html
<script>
  window.STEPPER_API_BASE = "https://your-backend.onrender.com";
</script>
```

### Option B — use the Sign In tab
This build also lets you paste the backend URL directly into the **Backend URL** field on the Sign In page and save it in the browser.

## 6) Render service ID note
A Render **service ID** helps you identify the service in the dashboard, but it is **not** the same thing as the public backend URL the site calls.
The frontend still needs the actual public URL, such as:

`https://your-backend.onrender.com`

## 7) Important distinction
- **Google sign-in** uses `GOOGLE_CLIENT_ID`
- **OpenAI** uses `OPENAI_API_KEY`
- **Gemini / Google AI** would use a separate backend key such as `GEMINI_API_KEY`

Do not paste API secrets into the browser code.
Only the Google **Client ID** is public-facing.
