# Mentoria.ai

**Mentoria.ai** is a full-stack career platform I built to help people sharpen their profile, practice interviews, and act on real job opportunities. It combines a FastAPI backend with a Next.js dashboard: authenticated APIs, persisted trials and subscriptions, and a cohesive UI for day-to-day career workflows.

## Description

The product wraps resume intelligence, skill-gap analysis, job matching, learning roadmaps, and scored mock interviews into one account. Trial users get time-limited access; when the trial ends, they are guided back to the marketing home page to **preview pricing only** until they upgrade—dashboard routes are not available in that state.

## App URL: 
https://ai-career-mentor-pksch8wh8-devoju-sai-sreekars-projects.vercel.app?_vercel_share=dfs7DrL4la0Ms6bDuNB54si6R4X3TWDr

## Features

- **Accounts & sessions** — Email/password auth, optional “remember me”, JWT access tokens with rotating refresh tokens stored server-side.
- **Free trial** — Trial window stored on the user; dashboard countdown can sync to server time. After expiry, only the home pricing preview (plus login/register for account changes) remains reachable while still signed in.
- **Resume AI** — Upload PDF/DOCX, ATS-oriented signals, structured feedback, and keyword/section insights.
- **Skill gap** — Compares profile and goals to surfaced skill expectations.
- **Jobs Match** — Filterable catalog (location, type, salary in INR, experience, skills, company type), match scores, save and apply flows.
- **Roadmap** — Multi-week plans with tasks and milestones, persisted progress.
- **Mock interviews** — Interview type and difficulty, generated questions (API with sensible timeout and offline-style fallback), voice capture via the **Web Speech API** where supported, **typed answers** when the browser blocks the mic, scoring and history.
- **Dashboard shell** — Sidebar navigation, notifications, profile menu, pricing page for upgrades.
- **Theming** — Light/dark theme via `data-theme` and local preference.

## Tech stack

| Layer | Technologies |
|--------|----------------|
| Frontend | Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, Zustand, Framer Motion |
| Backend | FastAPI, SQLAlchemy, SQLite (default), JWT + refresh tokens |
| AI | Google Gemini via LangChain for agent-heavy endpoints (resume, roadmap, interviews, etc.) |

## Installation

### Prerequisites

- **Node.js** 20+
- **Python** 3.11+
- A **Google Gemini API key** for AI-backed routes

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate

pip install -r requirements.txt
```

Create `backend/.env` (see variables below), then run:

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment variables

### Backend (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | postgresql://ai_career_db_cbdc_user:7yXXyLhnJ4xGQfp3shKeGQaPDuE4UMgk@dpg-d82adf57vvec73b4ff40-a.virginia-postgres.render.com/ai_career_db_cbdc |
| `SECRET_KEY` | 4d819713397cce3b205d1d7c2a23b68f2b9c23c34a4af62946985f0b8ad2fabc |
| `GEMINI_API_KEY` | AIzaSyAJF4bTl2J-DbM-WjcG87SdCZFlnwAfWTQ |

### Frontend (`frontend/.env.local`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | https://ai-career-mentor-l9l9.onrender.com/api/v1 |

## Folder structure

```
ai-career-mentor/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, router wiring
│   │   ├── api/endpoints/       # auth, resume, jobs, dashboard, interviews, …
│   │   ├── agents/              # LangChain / Gemini agents
│   │   ├── core/                # settings, security
│   │   ├── db/                  # engine, sessions, seeds
│   │   ├── models/              # SQLAlchemy models
│   │   └── data/                # static question bank helpers
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                 # App Router pages (marketing, auth, dashboard)
│   │   ├── components/          # Providers, nav, trial gate, etc.
│   │   ├── lib/                 # auth storage, trial helpers
│   │   └── store/               # Zustand stores
│   └── package.json
└── README.md
```

## Usage

1. Start the **backend**, then the **frontend**.
2. Open `http://localhost:3000`, **register** (optionally `?trial=true` for a trial), or **log in**.
3. Use **Resume AI** with a target role, review ATS-style output and suggestions.
4. Explore **Skill Gap**, **Jobs Match** (filters, save, apply), **Roadmap**, and **Mock Interviews** from the sidebar.
5. For interviews: pick type and difficulty, press **Start Interview** or **Refresh questions**, answer by **microphone** (Chrome/Edge recommended) and/or **typed text**, then **Submit Answer** for feedback.

## Deployment

### Backend

- Run `uvicorn` behind a process manager or container.
- Set a strong `SECRET_KEY`, production `DATABASE_URL` (e.g. PostgreSQL), and `GEMINI_API_KEY`.
- Terminate TLS at your edge; restrict CORS to your frontend origin.

### Frontend

- `npm run build` then `npm start`, then deployed on Vercel.
- Set `NEXT_PUBLIC_API_URL` to the public API URL.
- Ensure HTTPS in production so browser speech and secure cookies behave as expected.
