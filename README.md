# Rapid Stores

Local Zambian e-commerce demo (Mansa-focused)

## Run locally

1. `cd "c:\Users\PC-SOLUTIONS\Desktop\rapid stores"`
2. `npm install`
3. `npm start`
4. Open http://localhost:3000

## What it includes

- Static storefront pages served by Express.
- Browser-stored cart state shared across the site.
- Home, top sellers, checkout, and contact pages.

## Deploy to Railway (recommended)

1. Push to GitHub:
   - `git init`
   - `git add .`
   - `git commit -m "initial commit"`
   - create GitHub repo, then `git remote add origin <URL>`
   - `git push -u origin main`
2. Visit https://railway.app/, login, New Project -> Deploy from GitHub.
3. Select repo, set `Start Command: npm start` and port 3000 (default).
4. Deploy and open live URL.

## Alternative: Vercel (static + functions)

- For a simple static-only version, you can replace Express hosting with any static host.
- If you later add dynamic checkout or messaging, use serverless functions or a separate backend.

## Notes

- `style.css`, `index.html`, `page1.html`, `page2.html`, and `page3.html` are included.
- `server.js` serves the static site from the project root.
