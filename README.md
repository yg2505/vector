# Vector — AI Career Copilot

> An AI-powered career development platform that acts as your personal career coach, resume advisor, skill gap analyzer, and interview prep assistant.

---

## 🚀 Running Locally

This project has two separate servers. Open **two terminal windows**.

### Terminal 1 — Backend (FastAPI + Python)

```bash
cd /Users/yashvigoyal/Desktop/vector/backend

# Activate the Python virtual environment
source .venv/bin/activate

# Start the FastAPI server with live reload
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend runs at: **http://localhost:8000**  
API docs available at: **http://localhost:8000/docs**

---

### Terminal 2 — Frontend (Next.js)

```bash
cd /Users/yashvigoyal/Desktop/vector/frontend

# Start the Next.js development server
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## ⚙️ Environment Setup

Add your Gemini API key to `backend/.env`:

```env
GEMINI_API_KEY=your_key_here
```

If `GEMINI_API_KEY` is not set, the app uses intelligent mock fallbacks for all AI features — it will still work end to end.

---

## 📁 Project Structure

```
vector/
├── backend/           # FastAPI + Python
│   ├── app/
│   │   ├── main.py          # Entry point
│   │   ├── models.py        # SQLAlchemy DB models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── auth.py          # JWT authentication
│   │   ├── database.py      # SQLite/PostgreSQL setup
│   │   ├── config.py        # App settings
│   │   ├── routers/         # API route handlers
│   │   └── services/        # AI, PDF, Vector services
│   ├── .env                 # Environment variables
│   ├── requirements.txt     # Python dependencies
│   └── .venv/               # Python virtual environment
│
└── frontend/          # Next.js 15 + TypeScript
    └── src/
        ├── app/             # Pages (dashboard, skills, roadmap, resume, coach)
        ├── components/      # NavigationWrapper
        └── services/        # API client (api.ts)
```

---

## 🛠 First-time Setup (if .venv doesn't exist)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

```bash
cd frontend
npm install
```
