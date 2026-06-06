# 🚀 Healthcare AI Platform — Full Deployment Guide

This guide shows you exactly how to deploy this app **live on the internet** so that login, signup, and all data features work perfectly.

---

## 📋 Overview — What Gets Deployed Where

| Part | Service | Cost |
| :--- | :--- | :--- |
| **Backend (Node.js/Express API)** | [Render.com](https://render.com) | Free |
| **Database (PostgreSQL)** | Render.com (auto-provisioned) | Free |
| **Frontend (React/Vite)** | [Vercel.com](https://vercel.com) | Free |
| **Emergency Locator Maps** | OpenStreetMap Overpass API | Free (no key needed) |
| **AI Features (Disease/Mental Health)** | Google Gemini API | Free tier |

---

## 🗂️ Step 1 — Push to GitHub

Before deploying, your code must be on GitHub.

```bash
# If you haven't initialized Git yet
git init
git add .
git commit -m "Initial commit"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## 🗄️ Step 2 — Deploy Backend to Render.com

The backend handles all API calls, the database, login/signup, and AI features.

### 2.1 — Create a Render Account
Go to **[render.com](https://render.com)** → Sign Up (free, use your GitHub account).

### 2.2 — Deploy via Blueprint (Easiest Method)
This project includes a `render.yaml` file that auto-configures everything.

1. On Render dashboard, click **"New +"** → **"Blueprint"**
2. Connect your GitHub repo
3. Render will auto-detect the `render.yaml` file
4. Click **"Apply"** — this creates both the web service AND the PostgreSQL database automatically

### 2.3 — Set Environment Variables on Render
After deployment starts, go to your **Web Service** → **Environment** tab and add:

| Variable | Value | Where to Get It |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Your API key | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `FRONTEND_URL` | Your Vercel URL (set in Step 3) | After deploying frontend |
| `GOOGLE_MAPS_API_KEY` | *Optional* | [console.cloud.google.com](https://console.cloud.google.com) |

> **Note:** `DATABASE_URL` and `JWT_SECRET` are set automatically by Render Blueprint. You don't need to set them.

### 2.4 — Wait for Deployment
- Render will build and deploy in ~3-5 minutes
- Check the logs to see: `✅ Server is running on port 3000`
- Test it: visit `https://your-service-name.onrender.com/health` — you should see `{"status":"OK"}`

### 2.5 — Copy Your Backend URL
Your backend URL will look like:
```
https://healthcare-backend.onrender.com
```
**Save this URL — you need it in Step 3.**

---

## 🌐 Step 3 — Deploy Frontend to Vercel

### 3.1 — Create a Vercel Account
Go to **[vercel.com](https://vercel.com)** → Sign Up (free, use your GitHub account).

### 3.2 — Import Your Project
1. Click **"Add New..."** → **"Project"**
2. Choose your GitHub repository → Click **"Import"**
3. Vercel auto-detects it as a Vite project

### 3.3 — Set Environment Variables in Vercel
Before clicking Deploy, click **"Environment Variables"** and add:

| Variable | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://healthcare-backend.onrender.com/api` |

> ⚠️ **Critical:** The URL must end with `/api` exactly. Replace `healthcare-backend` with your actual Render service name.

### 3.4 — Deploy
Click **"Deploy"**. Vercel builds and deploys in ~2 minutes.

Your frontend URL will look like:
```
https://your-project.vercel.app
```

---

## 🔗 Step 4 — Connect Frontend ↔ Backend (CORS Fix)

Go back to **Render** → Your Web Service → **Environment** tab:

Update `FRONTEND_URL`:
```
FRONTEND_URL=https://your-project.vercel.app
```

Click **"Save Changes"** — Render restarts the server automatically.

✅ **Now your login, signup, and all API calls will work!**

---

## 🗺️ Emergency Locator — How It Works

The Emergency Locator uses **real-world hospital data** with this priority:

```
1. Local Database Cache (fastest – already fetched hospitals)
      ↓ (if < 5 results in DB)
2. Google Maps API (if GOOGLE_MAPS_API_KEY is set)
      ↓ (if no key OR Google fails)
3. OpenStreetMap Overpass API (FREE, real-world data, no key needed!)
      ↓ (if Overpass is down/slow)
4. Demo Fallback Data (always works, shows nearby approximate locations)
```

**You don't need a Google Maps API key.** The app uses free OpenStreetMap data by default and shows real hospitals, clinics, and pharmacies near any searched location.

---

## 🧪 Step 5 — Test Your Live App

After deployment, test these features:

| Feature | What to Test |
| :--- | :--- |
| ✅ Sign Up | Create a new account |
| ✅ Log In | Login with your account |
| ✅ Disease Predictor | Enter symptoms → get AI analysis |
| ✅ Emergency Locator | Search your city → see real hospitals on map |
| ✅ Medicine Reminder | Add a medication → check it persists after refresh |
| ✅ Blood Donation | Register as donor |
| ✅ Mental Health | Use the AI chat |

---

## 🔧 Troubleshooting

### ❌ Login/Signup doesn't work
- Check `FRONTEND_URL` on Render matches your Vercel URL **exactly** (no trailing slash)
- Check `VITE_API_URL` on Vercel ends with `/api`
- Open Browser DevTools → Network tab → look for red requests

### ❌ Emergency Locator shows no hospitals
- This is normal on the first search — it takes ~5-10 seconds to fetch from OpenStreetMap
- If it keeps failing, the Overpass API may be under load — try again in a minute

### ❌ AI features not working
- Make sure `GEMINI_API_KEY` is set in your Render environment variables
- Get a free key at: https://aistudio.google.com/app/apikey

### ❌ Render backend keeps sleeping (Free plan)
- On the free plan, Render services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds (cold start)
- Upgrade to Render's Starter plan ($7/mo) to prevent sleeping

### ❌ Data not persisting on Render
- Make sure `DATABASE_URL` is set (this is auto-set by the Render Blueprint)
- SQLite won't persist on Vercel serverless — always use PostgreSQL on Render

---

## 🔑 API Keys Summary

| Key | Required? | Where to Get |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Recommended | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `GOOGLE_MAPS_API_KEY` | ❌ Optional | [console.cloud.google.com](https://console.cloud.google.com) |
| `JWT_SECRET` | ✅ Auto-generated | Render Blueprint sets this |
| `DATABASE_URL` | ✅ Auto-generated | Render Blueprint sets this |

---

## ✨ You're Live!

Share your Vercel URL with the world. All user data is safely stored in PostgreSQL on Render, the Emergency Locator shows real hospitals from OpenStreetMap, and all AI features work via Gemini.
