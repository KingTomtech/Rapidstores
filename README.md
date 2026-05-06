# Rapid Stores

Local Zambian e-commerce demo (Mansa-focused)

## Run locally

1. `npm run install:all`
2. `npm run seed`
3. `npm start`
4. Open http://localhost:5000 for API
5. In another terminal, run `npm run dev:frontend` and open http://localhost:5173

## What it includes

- React frontend with Vite (in `rapid-stores/frontend/`)
- Express backend API with SQLite (in `rapid-stores/backend/`)
- Static storefront pages in project root (legacy)

## Deploy to Railway (recommended)

1. Push to GitHub:
   - `git add .`
   - `git commit -m "initial commit"`
   - create GitHub repo, then `git remote add origin <URL>`
   - `git push -u origin main`
2. Visit https://railway.app/, login, New Project -> Deploy from GitHub.
3. Select repo, set `Start Command: npm start` and port 5000 (default).
4. Deploy and open live URL.

## Alternative: Vercel (static + functions)

- Build the frontend with `npm run build`
- Deploy the `rapid-stores/frontend/dist` folder to any static host.

## Notes

- Root `package.json` provides convenience scripts.
- Backend requires `JWT_SECRET` environment variable (see `rapid-stores/backend/.env.example`).
