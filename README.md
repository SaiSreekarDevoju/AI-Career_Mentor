# Mentoria.ai

**Mentoria.ai** is a full-stack career platform I built to help people sharpen their profile, practice interviews, and act on real job opportunities. It combines a FastAPI backend with a Next.js dashboard: authenticated APIs, persisted trials and subscriptions, and a cohesive UI for day-to-day career workflows.

## Description

The product wraps resume intelligence, skill-gap analysis, job matching, learning roadmaps, and scored mock interviews into one account. Trial users get time-limited access; when the trial ends, they are guided back to the marketing home page to **preview pricing only** until they upgrade—dashboard routes are not available in that state.

## App URL: 
https://ai-career-mentor-pksch8wh8-devoju-sai-sreekars-projects.vercel.app?_vercel_share=dfs7DrL4la0Ms6bDuNB54si6R4X3TWDr

## Overview

Mentoria.ai combines multiple career tools into a single platform:
- Resume intelligence with ATS-style feedback
- Skill gap analysis based on career goals
- Job matching with scoring and filters
- AI-generated learning roadmaps
- Mock interviews with scoring and feedback
It also includes production-grade SaaS features like authentication, session handling, and trial-based access control.

## Features

## Authentication & Sessions
- Email/password login
- JWT-based authentication
- Refresh token rotation
- Secure session handling
- optional “remember me”

## Free Trial System
- Time-based trial stored per user
- Real-time countdown synced with backend
- Dashboard access restricted after expiry
- Pricing preview available post-trial

## Resume AI
- Upload PDF/DOCX resumes
- Extract structured content
- ATS-style evaluation
- Keyword optimization suggestions
- Section-wise feedback

## Skill Gap Analysis
- Compares current profile vs target role
- Identifies missing skills
- Provides actionable improvement insights

## Jobs Match
- Filterable catalog (location, type, salary in INR, experience, skills, company type)
- Match scoring algorithm
- Save and apply workflows

## Roadmap
- Multi-week plans with tasks and milestones
- Task-based progression
- Milestone tracking
- Persistent user progress

## Mock Interviews
- Role-based and difficulty-based interviews
- AI-generated questions
- Voice input using browser Speech API
- Typed fallback for unsupported devices
- AI-based scoring and feedback
- Interview history tracking

## Dashboard UI
- Sidebar navigation
- Notifications system
- Profile management
- Pricing page for upgrades.

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
| `DATABASE_URL` | Connection string for the database. It allows the backend (via SQLAlchemy) to connect to a PostgreSQL database and perform operations like storing users, interview history, jobs, and roadmaps. |
| `SECRET_KEY` | Secret key used for signing and verifying authentication tokens. It ensures secure user sessions by generating and validating JSON Web Token (JWTs). |
| `GEMINI_API_KEY` | API key for accessing Google Gemini. It is used by the AI layer (via LangChain) to generate resume feedback, interview questions, skill analysis, and learning roadmaps. |

### Frontend (`frontend/.env.local`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API. The frontend (built with Next.js) uses this to send requests for authentication, resume analysis, job matching, and interview features. The NEXT_PUBLIC_ prefix allows it to be accessible in the browser. |

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
