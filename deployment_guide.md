# 🚀 Comprehensive Deployment Guide

Since you're new to this, here is a step-by-step roadmap to taking your project live. We will use **Vercel** for the frontend and **Render** for the backend because they are beginner-friendly and offer great free tiers.

---

## 🏗️ Phase 1: Preparation (Checklist)
Before you start, make sure:
- [x] Your code is pushed to GitHub (Done!).
- [ ] You have a [Vercel](https://vercel.com) account.
- [ ] You have a [Render](https://render.com) account.
- [ ] You have your **Groq API Key** and **Google Client ID/Secret** ready.

---

## 🎨 Phase 2: Frontend Deployment (Vercel)
1. **Login to Vercel**: Sign in using your GitHub account.
2. **Import Project**: Click **"Add New"** -> **"Project"**. Select your `FriendAI` repository.
3. **Configure Project**:
   - **Framework Preset**: Next.js (Automatic).
   - **Root Directory**: `frontend` (⚠️ Important: Click "Edit" and change this to `frontend`).
4. **Add Environment Variables**: Under the "Environment Variables" section, add:
   - `NEXT_PUBLIC_BACKEND_URL`: `https://your-backend-url.onrender.com` (You'll get this in Phase 3).
   - `NEXTAUTH_URL`: `https://your-frontend-name.vercel.app`
   - `NEXTAUTH_SECRET`: Generate a random string (run `openssl rand -base64 32` in your terminal).
   - `GOOGLE_CLIENT_ID`: (Your Google ID).
   - `GOOGLE_CLIENT_SECRET`: (Your Google Secret).
5. **Deploy**: Click **"Deploy"**.

---

## ⚙️ Phase 3: Backend Deployment (Render)
1. **Login to Render**: Sign in with GitHub.
2. **New Web Service**: Click **"New +"** -> **"Web Service"**. Select your `FriendAI` repository.
3. **Configure Service**:
   - **Name**: `friend-ai-backend`.
   - **Root Directory**: `backend`.
   - **Environment**: `Python 3`.
   - **Build Command**: `pip install -r requirements.txt`.
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. **Environment Variables**: Click **"Advanced"** -> **"Add Environment Variable"**:
   - `GROQ_API_KEY`: (Your Groq Key).
   - `DATABASE_URL`: (Your Neon PostgreSQL URL).
   - `ALLOWED_ORIGINS`: `https://your-frontend-name.vercel.app` (The link you got from Vercel).
5. **Disk Support**: Since we use ChromaDB for memory, you need a "Disk" to save data permanently.
   - Go to the **"Disks"** tab in Render.
   - Create a disk with name `chroma-data`, Mount Path `/app/chroma_data`, and Size `1GB`.
   - Update your `CHROMA_DB_PATH` variable to `/app/chroma_data`.

---

## 🔗 Phase 4: Connecting the Dots
1. **Update Vercel**: Once your backend is live on Render, copy its URL and update the `NEXT_PUBLIC_BACKEND_URL` in your Vercel settings.
2. **Update Google Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   - Add your Vercel URL to **"Authorized JavaScript origins"**.
   - Add `https://your-frontend-name.vercel.app/api/auth/callback/google` to **"Authorized redirect URIs"**.

---

## 🏆 Success!
Your app should now be live and accessible from anywhere in the world. 🌍
