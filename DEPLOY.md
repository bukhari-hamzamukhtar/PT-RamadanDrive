# Deploying Project Topi Ration Portal

This guide explains how to push the app to GitHub and deploy it on Vercel with Supabase as the database.

---

## 1. Supabase setup

1. Go to [supabase.com](https://supabase.com) and create a new project (or use an existing one).
2. In the Supabase Dashboard, open **SQL Editor** and run the contents of `schema.sql` from this repo. This creates the `beneficiaries` table and RLS policies.
3. In **Project Settings → API**, copy:
   - **Project URL** → use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. Local environment

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` – from step 1
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – from step 1
   - `NEXT_PUBLIC_ADMIN_PASSWORD` – the code users will enter to unlock the app (e.g. a strong word or number)

---

## 3. GitHub

1. Create a new repository on GitHub (e.g. `project-topi-ration-portal`).
2. From the project root, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Project Topi Ration Portal"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repo name.

---

## 4. Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub is easiest).
2. Click **Add New → Project** and import the GitHub repo you just pushed.
3. Configure the project:
   - **Framework Preset:** Next.js
   - **Root Directory:** leave as `.`
   - **Build Command:** `next build` (default)
   - **Output Directory:** default
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - `NEXT_PUBLIC_ADMIN_PASSWORD` = your chosen gatekeeper code
5. Click **Deploy**. Vercel will build and deploy; the site URL will be something like `https://your-project.vercel.app`.

---

## 5. After deploy

- Open the deployed URL. You should see the landing page and the gatekeeper modal.
- Enter `NEXT_PUBLIC_ADMIN_PASSWORD` to unlock the app.
- Use **Lalas Inside GIKI** / **Lalas Outside GIKI** tabs, add beneficiaries, import Excel, and mark rows as done as needed.

---

## 6. Optional: custom domain

In the Vercel project → **Settings → Domains**, add your custom domain and follow the DNS instructions.

---

## 7. Security note

- `NEXT_PUBLIC_ADMIN_PASSWORD` is visible in the client. For production you may want to replace the simple gatekeeper with proper auth (e.g. Supabase Auth or another provider).
- The provided RLS policies allow full access with the anon key. For production, consider restricting by role or using a service role only on the server.
