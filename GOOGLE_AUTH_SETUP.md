# Google auth setup for Step-By-Stepper

This build now includes:
- Google sign-in on the frontend using **Google Identity Services**
- backend ID-token verification
- an online member count
- an admin-only tab for **Anthonytau4@gmail.com**
- automatic dance syncing into the backend registry so the admin tab can see what signed-in members make

For sign-in, you need a **Google OAuth 2.0 Client ID** for a **Web application**.
You do **not** need a Gemini key for this.

## 1) Create the Google OAuth client
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

Use the real frontend origin. It must match exactly.

## 3) Copy the Client ID
It will look something like:

`1234567890-abcdefg123456.apps.googleusercontent.com`

## 4) Put it in the backend environment
Set these on Render or whatever host you are using:

- `GOOGLE_CLIENT_ID=your_client_id_here`
- `ADMIN_EMAIL=anthonytau4@gmail.com`
- `ALLOWED_ORIGIN=https://your-frontend-domain.com`

Optional:
- `ONLINE_WINDOW_MS=180000`
- `OPENAI_API_KEY=...`
- `OPENAI_MODEL=gpt-5`

## 5) Point the frontend at the backend
This site now reads the backend URL from either:
- `window.STEPPER_API_BASE`
- or the **Backend URL** field on the new Sign In tab

Example:

```html
<script>
  window.STEPPER_API_BASE = "https://api.yourdomain.com";
</script>
```

## 6) Important distinction
- **Google sign-in** uses `GOOGLE_CLIENT_ID`
- **OpenAI** uses `OPENAI_API_KEY`
- **Gemini / Google AI** would use a separate backend key such as `GEMINI_API_KEY`

Do not paste private API keys into the browser code.
The Google **Client ID** is public-facing. Secret keys are not.

## 7) About the saved Render service ID
This build now has the Render service ID `srv-d6ss4295pdvs73e1iifg` baked into the Sign In page for reference. That helps identify the Render service, but it is not the same thing as a public backend URL and it is not a replacement for a Google OAuth Client ID. Render exposes a service's public onrender.com hostname separately from its service ID, and Google backend token verification still checks the token audience against your actual Google Client ID.

## 8) Frontend Google setup
The frontend page does not ask you to paste a Google Client ID by hand anymore. The Google button only appears when the backend reports that `GOOGLE_CLIENT_ID` is configured. Google's server-side token verification still requires that Client ID as the expected audience.
