# DevTrack

Side project I built to track my own coding sessions — hours logged, DSA problems, weekly goals, streaks, and a bit of XP/leaderboard stuff. GitHub stats pull in if you connect your account.

**Stack:** React + Vite, Express, MongoDB. Auth uses JWT in httpOnly cookies with CSRF.

## Run locally

Needs Node 20+ and MongoDB (local or Atlas).

```bash
npm install
cp server/.env.example server/.env
# fill in MONGODB_URI + secrets (or run: node scripts/generate-secrets.js)

npm run dev:server   # :5000
npm run dev:client   # :5173
```

Vite proxies `/api` to the backend — no `VITE_API_URL` needed in dev.

```bash
npm test
```

## Deploy

Frontend on **Vercel** (`client` as root), API on **Render** (`render.yaml` in repo root).

| Where | Variable | Notes |
|-------|----------|-------|
| Render | `MONGODB_URI` | Atlas connection string |
| Render | `CLIENT_URL` | Your Vercel URL, no trailing slash |
| Render | `COOKIE_SECURE` | `true` |
| Render | `JWT_*`, `CSRF_SECRET`, `ENCRYPTION_KEY` | `node scripts/generate-secrets.js` |
| Vercel | `VITE_API_URL` | `https://<api-host>/api/v1` |

After first deploy, set Render `CLIENT_URL` to the real Vercel URL and redeploy the API.

GitHub OAuth is optional — see `server/.env.example` for `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_OAUTH_CALLBACK_URL`.

## API routes

`/api/v1/auth` · `/progress` · `/goals` · `/analytics` · `/dashboard` · `/leaderboard` · `/github` · `/users/:username`

Env reference: `server/.env.example`, `client/.env.example`
