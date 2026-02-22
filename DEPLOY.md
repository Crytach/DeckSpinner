# Deploying DeckSpinner to Render (Free)

Your IONOS shared hosting is PHP-only, so DeckSpinner runs on **Render.com** (free Node.js hosting).  
Then you just link to it from your IONOS website.

---

## Step 1 — Push to GitHub

1. Create a **new GitHub repository** (e.g. `DeckSpinner`)
2. Push the project:

```bash
cd h:\DeckSpinner
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/DeckSpinner.git
git branch -M main
git push -u origin main
```

## Step 2 — Deploy on Render

1. Go to [render.com](https://render.com) and sign up (free, use your GitHub account)
2. Click **New** → **Web Service**
3. Connect your `DeckSpinner` GitHub repo
4. Configure:
   - **Name**: `deckspinner` (or whatever you like)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **Create Web Service**

Render will build and deploy automatically. Your app will be live at:  
`https://deckspinner.onrender.com` (or whatever name you chose)

> **Note**: Free tier spins down after 15 min of inactivity. First visit after idle takes ~30s to wake up.

## Step 3 — Link from Your IONOS Website

On your IONOS landing page, add a link:

```html
<a href="https://deckspinner.onrender.com" target="_blank">
  🎡 Open the Spinning Wheel
</a>
```

---

## Optional: Custom Subdomain

If you want `wheel.yourdomain.com` instead of the Render URL:

1. In Render dashboard → your service → **Settings** → **Custom Domains**
2. Add `wheel.yourdomain.com`
3. In your IONOS DNS settings, add a **CNAME record**:
   - Name: `wheel`
   - Target: `deckspinner.onrender.com`
4. Wait for DNS propagation (~5 min)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| App takes 30s to load | Normal on free tier after idle — upgrade to paid ($7/mo) for instant starts |
| Deploy fails | Check Render logs — usually a missing dependency |
| Cursors laggy | Free tier has limited resources — works fine for small groups |
