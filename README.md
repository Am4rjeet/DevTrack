# DEVTRACK

Production-ready MERN SaaS for developer progress tracking — coding hours, DSA practice, goals, streaks, XP, leaderboard, GitHub stats, and analytics.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, Tailwind, TanStack Query, Recharts |
| Backend | Node.js, Express, MongoDB, JWT (httpOnly cookies), Zod |
| Auth | Register/login, refresh rotation, email verification, CSRF |
| Deploy | Vercel (client) + Render (API) + MongoDB Atlas |

## Project structure

```
DEvtrack-2/
├── client/          # React SPA
├── server/          # Express API
├── .github/         # CI workflows
├── render.yaml      # Render blueprint (API)
└── scripts/         # Utility scripts
```

## Local development

### Prerequisites

- Node.js 20+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)

### Setup

```bash
# Install dependencies (monorepo workspaces)
npm install

# Server env
cp server/.env.example server/.env
# Edit server/.env — at minimum set MONGODB_URI and secrets

# Generate secrets (optional)
node scripts/generate-secrets.js
```

### Run

```bash
# Terminal 1 — API (http://localhost:5000)
npm run dev:server

# Terminal 2 — Frontend (http://localhost:5173)
npm run dev:client
```

The Vite dev server proxies `/api` to the backend. No `VITE_API_URL` needed locally.

### Test

```bash
npm test              # server + client
npm run test:server   # Jest (integration tests need MongoDB)
npm run test:client   # Vitest
```

## Production deployment

### Architecture

```
Browser → Vercel (SPA)  ──HTTPS──►  Render (API)  ──►  MongoDB Atlas
              │                              │
         VITE_API_URL                   MONGODB_URI
```

### 1. MongoDB Atlas

1. Create a free M0 cluster.
2. Database Access → create a DB user.
3. Network Access → allow `0.0.0.0/0` (or Render's IPs).
4. Copy the connection string → `MONGODB_URI`.

### 2. API on Render

1. Push this repo to GitHub.
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** → connect repo.
3. Render reads `render.yaml` and creates the `devtrack-api` web service.
4. Set environment variables in the Render dashboard:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas connection string |
| `JWT_ACCESS_SECRET` | 64+ char random hex |
| `JWT_REFRESH_SECRET` | 64+ char random hex |
| `CSRF_SECRET` | 64+ char random hex |
| `ENCRYPTION_KEY` | 32-byte hex (64 chars) |
| `CLIENT_URL` | `https://your-app.vercel.app` (no trailing slash) |
| `COOKIE_SECURE` | `true` |
| `COOKIE_DOMAIN` | leave empty (cross-origin cookies) |
| `GITHUB_OAUTH_CALLBACK_URL` | `https://devtrack-api.onrender.com/api/v1/github/oauth/callback` |
| `EMAIL_*` | SMTP credentials (optional) |

Generate secrets: `node scripts/generate-secrets.js`

5. Deploy → note your API URL, e.g. `https://devtrack-api.onrender.com`.
6. Verify: `GET https://devtrack-api.onrender.com/api/v1/health`

### 3. Frontend on Vercel

1. [Vercel](https://vercel.com) → **Import** Git repo.
2. **Root Directory**: `client`
3. **Framework Preset**: Vite
4. Environment variable:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://devtrack-api.onrender.com/api/v1` |

5. Deploy → note your frontend URL.
6. Update Render `CLIENT_URL` to match the Vercel URL and redeploy the API.

### 4. GitHub OAuth (optional)

1. [GitHub Developer Settings](https://github.com/settings/developers) → **New OAuth App**
2. Homepage URL: your Vercel URL
3. Callback URL: `https://<api-host>/api/v1/github/oauth/callback`
4. Set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_OAUTH_CALLBACK_URL` on Render.

### 5. Custom domain (optional)

If both app and API share a parent domain (e.g. `app.devtrack.com` + `api.devtrack.com`):

- Set `COOKIE_DOMAIN=.devtrack.com`
- Update `CLIENT_URL` and `VITE_API_URL` to custom URLs
- Configure DNS + SSL in Vercel and Render

## Environment reference

See `server/.env.example` and `client/.env.example` for all variables.

**Production checklist**

- [ ] `COOKIE_SECURE=true`
- [ ] `CLIENT_URL` matches exact Vercel origin (scheme + host, no path)
- [ ] `VITE_API_URL` points to `/api/v1` on the API host
- [ ] MongoDB Atlas allows Render connections
- [ ] GitHub OAuth callback uses production API URL
- [ ] Secrets are unique per environment (never reuse dev secrets)

## API overview

| Prefix | Description |
|--------|-------------|
| `/api/v1/auth` | Authentication + CSRF |
| `/api/v1/progress` | Progress entries |
| `/api/v1/goals` | Goals & milestones |
| `/api/v1/analytics` | Charts & heatmap |
| `/api/v1/dashboard` | Combined dashboard |
| `/api/v1/leaderboard` | Rankings |
| `/api/v1/github` | GitHub integration |
| `/api/v1/users/:username` | Public profiles |

## CI

GitHub Actions run on push/PR:

- **Server CI** — Jest with MongoDB service container
- **Client CI** — Vite build + Vitest

## License

Private — all rights reserved.
