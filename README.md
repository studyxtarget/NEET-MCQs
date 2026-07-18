# NEET AI Quiz

PDF → text extraction → AI-generated MCQs → quiz → score + weak-topic analysis.

```
neet-mcq/
  backend/     FastAPI service (see backend/README.md)
  frontend/    React + Tailwind UI (this file covers it)
```

## Run both together

**Terminal 1 — backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add your ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000
```

**Terminal 2 — frontend**
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — it talks to the backend at
`http://localhost:8000` by default (see `frontend/src/api.js`).

## How the UI flows

1. **Upload** (`UploadBox.jsx`) — pick a PDF, it's sent to `/upload`. Once
   text is extracted, a config panel appears: subject, chapter, question
   count, difficulty, and mode (`extract_existing` vs `generate_new`).
   "Generate Quiz" calls `/generate`.
2. **Quiz** (`Quiz.jsx`) — one question at a time. Tapping an option locks
   it and shows correct/incorrect immediately, plus the explanation.
   "Next" advances; on the last question it POSTs all answers to `/submit`.
3. **Result** (`Result.jsx`) — score, percentage, and a weak-topics list
   sorted weakest-first, straight from the backend's `/submit` response.

## Known gaps (next to fix)

- Backend storage is in-memory — restarting the server wipes uploaded docs
  and quizzes. Fine for local dev, not for anything real.
- `chunk_text()` exists in `pdf_extractor.py` but isn't wired into
  `/generate` yet, so very long PDFs may hit token limits.
- No auth / rate limiting — don't deploy this publicly as-is.
- `frontend/src/api.js` hardcodes `http://localhost:8000`; set
  `VITE_API_BASE_URL` in a `.env` file for other environments.
