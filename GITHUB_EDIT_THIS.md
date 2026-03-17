# Step-By-Stepper backend: what to edit in GitHub

## 1) Add these files to your repo
Add the whole `backend` folder.

## 2) Do NOT commit a real key
Copy `backend/.env.example` to `backend/.env` on the machine that runs the backend.
Keep `.env` out of GitHub.

## 3) Front-end edit
In your site, add the contents of `frontend/api-client-example.js`.
Then set this once somewhere near your main script:

```html
<script>
  window.STEPPER_API_BASE = "https://YOUR-BACKEND-DOMAIN";
</script>
```

Use your backend with:

```js
const text = await stepperAskBackend("Explain this dance step simply.");
```

## 4) GitHub Pages note
GitHub Pages is for the static front end only.
Your Node backend must run somewhere that supports a server process.

## 5) Exact files to commit to GitHub
- `backend/package.json`
- `backend/server.mjs`
- `backend/.env.example`
- `backend/.gitignore`
- anything from your front end that calls `stepperAskBackend(...)`

## 6) Local run
From the `backend` folder:

```bat
npm install
npm run dev
```

Then open:
- `http://localhost:3000/api/health`

You should get JSON back.
