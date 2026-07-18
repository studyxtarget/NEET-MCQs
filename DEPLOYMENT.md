# Deployment Guide

This takes the project from "runs on my laptop" to a live website, using
GitHub + Render (backend) + Vercel (frontend) — all have free tiers.

## 0. Folder structure check

Push the whole `neet-mcq/` folder as one GitHub repo:

```
neet-mcq/
├── render.yaml            ← tells Render how to run the backend
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .gitignore          ← keeps .env out of git
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py
│   └── services/
│       ├── __init__.py
│       ├── pdf_extractor.py
│       └── ai_generator.py
└── frontend/
    ├── vercel.json
    ├── package.json
    └── src/...
```

The `__init__.py` files make `models` and `services` proper Python
packages — without them, some hosts fail on `from models.schemas import ...`.

## 1. Push to GitHub

```bash
cd neet-mcq
git init
git add .
git commit -m "Initial commit: NEET MCQ generator"
git branch -M main
git remote add origin https://github.com/<your-username>/neet-mcq.git
git push -u origin main
```

Double-check `.env` is **not** in the commit — `git status` should not
list it. It's already in `backend/.gitignore`.

## 2. Deploy the backend (Render)

1. Go to render.com → **New → Web Service** → connect your GitHub repo.
2. Render should auto-detect `render.yaml` at the repo root and pre-fill
   the settings (root dir `backend`, build/start commands). If it doesn't
   auto-detect, set manually:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Under **Environment**, add:
   - `ANTHROPIC_API_KEY` = your real key (never commit this to GitHub)
4. Deploy. You'll get a URL like `https://neet-mcq-backend.onrender.com`.
5. Test it: `https://neet-mcq-backend.onrender.com/health` should return
   `{"status": "ok"}`.

Note: Render's free tier spins down after inactivity — the first request
after idle can take ~30-50s to wake up. Fine for testing, worth upgrading
before real users depend on it.

## 3. Deploy the frontend (Vercel)

1. Go to vercel.com → **New Project** → import the same GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL` = your Render backend URL (e.g.
     `https://neet-mcq-backend.onrender.com`)
4. Deploy. You'll get a URL like `https://neet-mcq.vercel.app`.

## 4. Lock down CORS

`backend/main.py` currently has:
```python
allow_origins=["*"]
```
Once you know your real frontend URL, tighten this:
```python
allow_origins=["https://neet-mcq.vercel.app"]
```
Otherwise any website can call your backend and burn your Claude API quota.

## 5. Test end-to-end

Open your Vercel URL, upload a PDF, generate a quiz, submit answers. If
`/upload` fails with a network error, it's almost always one of:
- `VITE_API_BASE_URL` not set (or set without `https://`)
- CORS not allowing the Vercel domain yet
- Backend still "waking up" from Render's free-tier sleep — wait ~40s and retry

## What's still not production-ready

Carried over from `backend/README.md` — worth fixing before real traffic:
- In-memory storage (`DOCUMENTS`, `QUIZZES` dicts) — add Postgres/Supabase
  so data survives a redeploy or backend restart.
- No auth or per-user rate limiting on `/generate` — each call costs a
  Claude API request.
- Long PDFs aren't chunked yet in `/generate` (the `chunk_text()` helper
  exists in `pdf_extractor.py` but isn't wired in).
