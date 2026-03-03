# 🚀 GitHub Setup & Deployment Guide for Notes Hub

## Step 1: Initialize Git (Run in Terminal)

Open PowerShell in the workspace directory and run:

```bash
cd d:\website_details
git init
git config user.name "Your Name"
git config user.email "your.email@gmail.com"
git add .
git commit -m "Initial commit: Notes Hub with frontend and backend"
```

## Step 2: Create GitHub Repository

1. Go to **https://github.com/new**
2. Create a repository named: **notes-hub** (or your preferred name)
3. Do NOT initialize with README, .gitignore, or license (we already have these)
4. Click **Create repository**

## Step 3: Connect Local Repo to GitHub

After creating the repo, GitHub will show commands. Copy the commands shown or run:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/notes-hub.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 4: Deploy to Vercel (Recommended - FREE!)

### Option A: Deploy with Vercel + GitHub (Easiest)

1. Go to **https://vercel.com**
2. Click **Sign Up** → Connect with **GitHub**
3. Click **Import Project**
4. Select your **notes-hub** repository
5. Vercel auto-detects the `vercel.json` we created
6. Click **Deploy** → Wait 2-3 minutes
7. **Your site is live!** 🎉

**Your live URL:** `https://notes-hub-xxx.vercel.app`

### Option B: Use GitHub Pages (Frontend Only)

If you only need the frontend visible:

1. Go to your GitHub repository **Settings** → **Pages**
2. Under "Source", select **main** branch → **/root** → Save
3. Select a theme or keep it as is
4. Your frontend deploys in ~2 minutes

**Your frontend URL:** `https://YOUR_USERNAME.github.io/notes-hub`

## Step 5: Test Backend API

The backend API will be available at:
- `https://notes-hub-xxx.vercel.app/api/` (via Vercel)
- Or localhost for local testing

Update your frontend `config.js` if needed:

```javascript
// notes-hub/frontend/js/config.js
const API_BASE = "https://notes-hub-xxx.vercel.app/api";
```

## ✅ Summary

| Method | Frontend | Backend | Setup Time |
|--------|----------|---------|-----------|
| **Vercel + GitHub** | ✅ Live | ✅ Live | ~10 min |
| **GitHub Pages** | ✅ Live | ❌ (Need separate hosting) | ~5 min |
| **GitHub Only** | 📁 Code shared | 📁 Code shared | ~5 min |

---

## Troubleshooting

**Push failed?** Run:
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

**Want to update after changes:**
```bash
git add .
git commit -m "Your message"
git push
```

---

**Your GitHub repo link:** `https://github.com/YOUR_USERNAME/notes-hub`

After deployment, share this link with anyone! 🎉
