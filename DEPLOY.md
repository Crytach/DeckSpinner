# Deploying DeckSpinner — Full Guide

Your setup has **two parts** because IONOS shared hosting is PHP-only (no Node.js):

| Part | Hosted On | What |
|------|-----------|------|
| **Landing page** | IONOS | Static HTML in `landing/index.html` |
| **Spinning wheel app** | Render.com (free) | Node.js app with real-time multiplayer |

---

## Part 1 — Deploy the Wheel App to Render

### 1A. Push to GitHub

Create a new GitHub repo and push the project (do NOT include the `landing/` folder):

```bash
cd h:\DeckSpinner
git init
git add server.js package.json .gitignore public/
git commit -m "DeckSpinner app"
git remote add origin https://github.com/YOUR_USERNAME/DeckSpinner.git
git branch -M main
git push -u origin main
```

### 1B. Create a Render Web Service

1. Go to [render.com](https://render.com) → sign up with GitHub
2. Click **New** → **Web Service** → connect your `DeckSpinner` repo
3. Set:
   - **Name**: `deckspinner`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Click **Create Web Service**

Your wheel is now live at: `https://deckspinner.onrender.com`

> Free tier sleeps after 15 min idle. First visit after sleep takes ~30s.

---

## Part 2 — Deploy the Landing Page to IONOS

### 2A. Update the link

Open `landing/index.html` and change this line to your Render URL:

```html
<a href="https://deckspinner.onrender.com" class="btn-cta" target="_blank">
```

### 2B. Upload to IONOS

1. Log into **IONOS** → go to **Hosting** → **File Manager** (or use FTP)
2. Navigate to your root web directory (usually `/` or `/htdocs/`)
3. Upload the contents of the `landing/` folder:
   - `index.html` → upload to root

That's it! Your landing page is now live at `yourdomain.com` and the "Launch the Wheel" button opens DeckSpinner on Render.

---

## Optional: Custom Subdomain for the Wheel

Instead of `deckspinner.onrender.com`, use `wheel.yourdomain.com`:

1. In Render → your service → **Settings** → **Custom Domains** → add `wheel.yourdomain.com`
2. In IONOS → **Domains & SSL** → **DNS Settings** → add a **CNAME** record:
   - **Hostname**: `wheel`
   - **Points to**: `deckspinner.onrender.com`
3. Update the link in `landing/index.html` to `https://wheel.yourdomain.com`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| IONOS page shows directory listing | Make sure your file is named `index.html` in the root |
| Wheel takes 30s to load | Normal on Render free tier after idle |
| Render deploy fails | Check logs — usually a missing dependency |
