# Admin CMS — Account & Environment Setup

These are the **one-time accounts/keys** only you (the owner) can create. Fill them into
`site/.env.local` for local testing, and into the Vercel project's Environment Variables for
production. None of these secrets are committed to git.

## 1. Auth.js secret
```
cd site
npx auth secret      # prints AUTH_SECRET; paste into .env.local
```

## 2. Google OAuth client (so Ariel can "Sign in with Google")
1. Go to <https://console.cloud.google.com/> → create/select a project.
2. **APIs & Services → OAuth consent screen**: External, app name "Ariel Levi Admin",
   add your email as a test user (and Ariel's), save.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID → Web application**.
4. Authorized redirect URIs — add **both**:
   - `http://localhost:3000/api/auth/callback/google`  (local dev)
   - `https://<your-vercel-domain>/api/auth/callback/google`  (production)
5. Copy the Client ID → `AUTH_GOOGLE_ID`, Client secret → `AUTH_GOOGLE_SECRET`.
6. `ALLOWED_EMAIL` = the single Google address allowed in (Ariel's: `arielefraim5@gmail.com`).

## 3. GitHub fine-grained token (so saves commit content.json)
1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate**.
2. Repository access: **Only select repositories → `IdoLevi235/ArielPortfolio`**.
3. Permissions: **Contents → Read and write** (everything else: no access).
4. Copy the token → `GITHUB_TOKEN`. Set `GITHUB_REPO=IdoLevi235/ArielPortfolio`, `GITHUB_BRANCH=main`.
   - Leave `GITHUB_TOKEN` **empty** locally to use the local-file fallback (saves write to disk
     instead of committing — handy for testing).

## 4. Cloudinary (image + video hosting)
1. Create a free account at <https://cloudinary.com/>.
2. Dashboard → Product Environment Credentials: copy **Cloud name**, **API Key**, **API Secret**.
3. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and
   `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (same cloud name).

## 5. Vercel
1. Import the GitHub repo into Vercel (root directory: `site`).
2. Add all the env vars above under Project → Settings → Environment Variables (Production + Preview).
3. (Optional) Project → Settings → rename so the URL is a short `*.vercel.app` subdomain;
   use that domain in the Google redirect URI above.

## Local testing
```
cd site
cp .env.local.example .env.local   # then fill values
npm run dev                         # http://localhost:3000/admin
```
With `GITHUB_TOKEN` empty, "Publish" writes to `data/content.json` locally so you can verify
the whole flow without committing.
