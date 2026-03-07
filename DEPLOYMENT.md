# Deployment Guide — 100% Free Hosting

This project is set up to deploy across three environments using **entirely free** cloud services:

| Layer | Service | Free Limits |
|---|---|---|
| 🗄️ Database | MongoDB Atlas M0 | 512 MB, shared cluster, forever free |
| ⚙️ Backend API | Render Web Service | 750 hrs/month (enough for one service 24/7) |
| 🎨 Frontend SPA | Vercel Hobby Plan | Unlimited deployments, global CDN, custom domain |
| 🔄 CI/CD | GitHub Actions | 2 000 min/month (public repos: unlimited) |

> ⚠️ **Render free tier note**: The free web service spins down after 15 minutes of inactivity. The first request after a cold start takes ~30 seconds. Upgrade to the $7/month "Starter" plan to keep it always-on.

---

## Step 1 — MongoDB Atlas (free database)

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → **Try Free**.
2. Create an account and click **Create a FREE cluster** → choose **M0 Sandbox** (free forever).
3. Pick any cloud provider / region (AWS us-east-1 is a good default).
4. Once the cluster is created, click **Database Access** → **Add New Database User**.
   - Choose **Password** authentication. Save the username and password.
5. Click **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`).
6. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```
7. Create **three databases** (one per environment) by replacing `<dbname>`:
   - `yps-academy-dev`
   - `yps-academy-test`
   - `yps-academy-prod`

---

## Step 2 — Render (free backend)

### 2a. Import via Blueprint (easiest)

1. Go to [https://render.com](https://render.com) → sign up (GitHub login recommended).
2. Dashboard → **New** → **Blueprint**.
3. Connect your GitHub repo (`yps-academy-udgir/yps-academy-web`) and select the `render.yaml` file at the root.
4. Render will create three services: `yps-backend-dev`, `yps-backend-test`, `yps-backend-prod`.

### 2b. Set environment variables for each service

For each service, go to **Environment** tab and add:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Connection string from Step 1 (use the matching database name) |
| `FRONTEND_URL` | Your Vercel URL for that environment (fill in after Step 3) |

### 2c. Get deploy hook URLs

1. Open each Render service → **Settings** → scroll to **Deploy Hook**.
2. Copy the hook URL and add it as a GitHub Secret:

| Service | GitHub Secret name |
|---|---|
| `yps-backend-dev` | `RENDER_DEV_DEPLOY_HOOK` |
| `yps-backend-test` | `RENDER_TEST_DEPLOY_HOOK` |
| `yps-backend-prod` | `RENDER_PROD_DEPLOY_HOOK` |

---

## Step 3 — Vercel (free frontend)

### 3a. Create a Vercel project

1. Go to [https://vercel.com](https://vercel.com) → sign up (GitHub login).
2. **Add New Project** → import `yps-academy-udgir/yps-academy-web`.
3. Set **Root Directory** to `frontend`.
4. Vercel will auto-detect the build settings from `frontend/vercel.json`:
   - Build Command: `npm run build:prod`
   - Output Directory: `dist/frontend/browser`
5. Click **Deploy**. Your first production URL will be something like `yps-academy-web.vercel.app`.

### 3b. Get Vercel tokens and IDs

1. **Token**: [https://vercel.com/account/tokens](https://vercel.com/account/tokens) → **Create** → copy it.
2. **Org ID & Project ID**: Install the Vercel CLI locally:
   ```bash
   npm i -g vercel
   cd frontend
   vercel link   # connects the local folder to your Vercel project
   cat .vercel/project.json
   # → { "orgId": "team_xxx", "projectId": "prj_xxx" }
   ```
3. Add three GitHub Secrets:

| Secret | Value |
|---|---|
| `VERCEL_TOKEN` | Personal access token from step 1 |
| `VERCEL_ORG_ID` | `orgId` from `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |

> **Do not commit** `.vercel/project.json` — it is already in `.gitignore`.

---

## Step 4 — Add GitHub Secrets

In your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Add all of the following:

| Secret | Where to get it |
|---|---|
| `VERCEL_TOKEN` | Vercel → Account → Tokens |
| `VERCEL_ORG_ID` | `frontend/.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `frontend/.vercel/project.json` |
| `RENDER_DEV_DEPLOY_HOOK` | Render `yps-backend-dev` → Settings → Deploy Hook |
| `RENDER_TEST_DEPLOY_HOOK` | Render `yps-backend-test` → Settings → Deploy Hook |
| `RENDER_PROD_DEPLOY_HOOK` | Render `yps-backend-prod` → Settings → Deploy Hook |

---

## Step 5 — Branch strategy (triggers auto-deploy)

| Branch | Environment | Auto-deploys to |
|---|---|---|
| `develop` | Development | Vercel preview + Render dev |
| `staging` | Test/Staging | Vercel preview (staging alias) + Render test |
| `main` | Production | Vercel production + Render prod |

Push to any of these branches and GitHub Actions will:
1. Build the Angular app with the correct environment config.
2. Deploy the frontend to Vercel.
3. Trigger a Render redeploy for the backend.

---

## Local development (Docker, no cloud needed)

If you want to run everything locally without any cloud accounts:

```bash
# Spin up the full dev stack (requires Docker Desktop)
./deploy.sh dev up

# View logs
./deploy.sh dev logs

# Stop
./deploy.sh dev down
```

Copy `backend/.env.dev.example` to `backend/.env` and fill in your values first.

---

## Environment URLs summary

| Environment | Frontend | Backend |
|---|---|---|
| Dev | `<branch>.vercel.app` preview URL | `yps-backend-dev.onrender.com` |
| Test | `staging-yps-academy.vercel.app` | `yps-backend-test.onrender.com` |
| Prod | `yps-academy-web.vercel.app` (or custom domain) | `yps-backend-prod.onrender.com` |

> Update `frontend/src/environments/environment.prod.ts` and `environment.test.ts` with the actual Render backend URLs once they are created.
