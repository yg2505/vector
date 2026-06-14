# Vector — AI Career Copilot

> An AI-powered career development platform that acts as your personal career coach, resume advisor, skill gap analyzer, and interview prep assistant — all in one place.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [API Reference](#api-reference)
- [Pages & Features Walkthrough](#pages--features-walkthrough)
- [Mock Mode](#mock-mode)

---

## Overview

**Vector** is a full-stack AI career platform built with a **FastAPI** backend and a **Next.js 15** frontend. It leverages **Google Gemini** to power intelligent features including resume parsing, skill gap analysis, personalized learning roadmaps, and a conversational career coach.

Whether you're a job seeker looking to optimize your resume or a professional planning your next career move, Vector gives you actionable, AI-driven insights in seconds.

---

## Features

| Feature | Description |
|---|---|
| **Resume Analysis** | Upload a PDF resume and get an AI-powered breakdown of your experience, skills, and improvement suggestions |
| **Skill Gap Analysis** | Compare your current skills against target roles and identify what you need to learn |
| **Learning Roadmap** | Get a personalized, step-by-step roadmap to reach your career goal |
| **AI Career Coach** | Chat with an AI assistant for career advice, interview tips, and guidance |
| **Dashboard** | Central hub showing your career progress, skills overview, and recent activity |
| **JWT Authentication** | Secure user accounts with token-based authentication |
| **Mock Fallbacks** | All AI features work end-to-end even without a Groq API key |

---

## Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI** — high-performance async REST API
- **SQLAlchemy** — ORM for database models
- **SQLite** (default) / **PostgreSQL** (production)
- **Pydantic** — data validation and schemas
- **JWT** — authentication via `python-jose`
- **Groq API** — AI language model for all intelligent features

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **CSS Modules**
- **React** (functional components + hooks)

### Language breakdown
```
TypeScript   65.5%
Python       27.0%
CSS           7.2%
JavaScript    0.3%
```

---

## Architecture

```
Browser (Next.js 15)
       │
       │  HTTP / REST
       ▼
FastAPI Backend (port 8000)
       │
       ├── JWT Auth Layer
       ├── Routers  ──► /auth, /resume, /skills, /roadmap, /coach
       ├── Services ──► AI Service (Groq), PDF Parser, Vector Store
       └── Database ──► SQLite (dev) / PostgreSQL (prod)
                          │
                          └── SQLAlchemy ORM
```

All AI calls are routed through a dedicated **AI service** layer. If `GROQ_API_KEY` is absent, the service automatically falls back to intelligent mock responses so the app remains fully functional during development.

---

## Project Structure

```
vector/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app entry point; mounts all routers
│   │   ├── models.py         # SQLAlchemy ORM models (User, Resume, Skill, etc.)
│   │   ├── schemas.py        # Pydantic request/response schemas
│   │   ├── auth.py           # JWT token creation, hashing, and verification
│   │   ├── database.py       # Database engine and session setup (SQLite/PostgreSQL)
│   │   ├── config.py         # App settings loaded from .env
│   │   ├── routers/
│   │   │   ├── auth.py       # POST /auth/register, POST /auth/login
│   │   │   ├── resume.py     # POST /resume/upload, GET /resume/analysis
│   │   │   ├── skills.py     # GET /skills, POST /skills/gap-analysis
│   │   │   ├── roadmap.py    # GET /roadmap, POST /roadmap/generate
│   │   │   └── coach.py      # POST /coach/chat (conversational AI)
│   │   └── services/
│   │       ├── ai_service.py     # Groq API calls with mock fallbacks
│   │       ├── pdf_service.py    # PDF text extraction from uploaded resumes
│   │       └── vector_service.py # Embedding and similarity utilities
│   ├── .env                  # Environment variables (do not commit)
│   ├── requirements.txt      # Python dependencies
│   └── .venv/                # Python virtual environment (local only)
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx          # Landing / login page
│       │   ├── dashboard/        # Career overview dashboard
│       │   ├── skills/           # Skill gap analysis page
│       │   ├── roadmap/          # Learning roadmap page
│       │   ├── resume/           # Resume upload and analysis page
│       │   └── coach/            # AI career coach chat page
│       ├── components/
│       │   └── NavigationWrapper.tsx  # Sidebar/nav shell shared across pages
│       └── services/
│           └── api.ts            # Typed API client (wraps fetch calls to backend)
│
├── mock_resume.pdf           # Sample resume for testing
├── .gitignore
└── README.md
```

---

## Prerequisites

Make sure you have the following installed before proceeding:

- **Python 3.11+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git**
- *(Optional)* A **Groq API key** for live AI features 

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yg2505/vector.git
cd vector
```

### 2. Backend Setup

```bash
cd backend

# Create a Python virtual environment
python3 -m venv .venv

# Activate it
# macOS / Linux:
source .venv/bin/activate
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install Node dependencies
npm install
```

---

## Environment Variables

Create a `.env` file inside the `backend/` directory:

```bash
# backend/.env

# Google Gemini API key (optional — app uses mock fallbacks if not set)
GROQ_API_KEY=your_gemini_api_key_here

# JWT secret (change this to a strong random string in production)
SECRET_KEY=your_secret_key_here

# Database URL (defaults to SQLite for local dev)
# For PostgreSQL: postgresql://user:password@localhost:5432/vector_db
DATABASE_URL=sqlite:///./vector.db

# Token expiry in minutes (default: 30)
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

> **Note:** If `GROQ_API_KEY` is not provided, all AI endpoints automatically return intelligent mock responses. The application works end-to-end without a key.

---

## Running the App

You need **two terminal windows** running simultaneously — one for the backend and one for the frontend.

### Terminal 1 — Backend (FastAPI)

```bash
cd backend
source .venv/bin/activate       # Windows: .\.venv\Scripts\Activate.ps1

uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- API base URL: `http://localhost:8000`
- Interactive API docs (Swagger UI): `http://localhost:8000/docs`
- Alternative docs (ReDoc): `http://localhost:8000/redoc`

### Terminal 2 — Frontend (Next.js)

```bash
cd frontend
npm run dev
```

- App URL: `http://localhost:3000`

---

## API Reference

All endpoints are documented interactively at `http://localhost:8000/docs` when the backend is running. Here is a summary:

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user account |
| `POST` | `/auth/login` | Log in and receive a JWT access token |

### Resume

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/resume/upload` | Upload a PDF resume for parsing |
| `GET` | `/resume/analysis` | Retrieve AI analysis of the uploaded resume |

### Skills

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/skills` | Get the user's current skill profile |
| `POST` | `/skills/gap-analysis` | Run a skill gap analysis against a target job role |

### Roadmap

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/roadmap` | Retrieve the user's current learning roadmap |
| `POST` | `/roadmap/generate` | Generate a new personalized roadmap for a target role |

### Coach

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/coach/chat` | Send a message to the AI career coach |

All protected endpoints require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Pages & Features Walkthrough

### Dashboard (`/dashboard`)
The central hub of your career journey. Shows a summary of your current skills, resume health score, roadmap progress, and quick links to all other features.

### Resume (`/resume`)
Upload your PDF resume. The backend extracts the text via `pdf_service.py` and passes it to the Gemini AI, which returns:
- A parsed list of skills and experience
- Resume quality score
- Specific, actionable improvement suggestions

A sample resume is included at `mock_resume.pdf` in the repository root for testing.

### Skills (`/skills`)
Enter a target job role (e.g., "Senior Data Engineer" or "Product Manager"). Vector compares your resume's extracted skills against the requirements for that role and returns:
- Skills you already have (matched)
- Skills you're missing (gaps)
- Proficiency estimates for existing skills

### Roadmap (`/roadmap`)
Based on your skill gaps, Vector generates a structured, time-bound learning roadmap including:
- Recommended courses, topics, and resources
- Estimated time to close each skill gap
- Milestone checkpoints

### Coach (`/coach`)
A conversational AI assistant powered by Gemini. Ask it anything career-related:
- "How should I prepare for a system design interview?"
- "What salary should I negotiate for a mid-level frontend role?"
- "Review my career transition plan from finance to tech."

---

## Mock Mode

If no `GROQ_API_KEY` is set in `backend/.env`, all AI features gracefully fall back to pre-built mock responses. This means:

- Resume analysis returns a realistic example analysis
- Skill gap analysis returns example gaps for the requested role
- Roadmap generation returns a sample learning plan
- The coach replies with coherent placeholder responses

This is ideal for **local development and UI testing** without consuming API quota.

---


