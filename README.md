# Mentoria.ai

**Mentoria.ai** is a full-stack career platform I built to help people sharpen their profile, practice interviews, and act on real job opportunities. It combines a FastAPI backend with a Next.js dashboard: authenticated APIs, persisted trials and subscriptions, and a cohesive UI for day-to-day career workflows.

## Description

The product wraps resume intelligence, skill-gap analysis, job matching, learning roadmaps, and scored mock interviews into one account. Trial users get time-limited access; when the trial ends, they are guided back to the marketing home page to **preview pricing only** until they upgrade—dashboard routes are not available in that state.

## App URL

Updates are underway; a public deployment link will be added here when it is available.

## Overview

Mentoria.ai combines multiple career tools into a single platform:
- Resume intelligence with ATS-style feedback
- Skill gap analysis based on career goals
- Job matching with scoring and filters
- AI-generated learning roadmaps
- Mock interviews with scoring and feedback
It also includes authentication, session handling, and trial-based access control.

## Features

### Authentication & Sessions
- Email/password login
- JWT-based authentication
- Refresh token rotation
- Secure session handling
- Optional “remember me”

### Free Trial System
- Time-based trial stored per user
- Countdown synchronized with backend state
- Dashboard access restricted after expiry
- Pricing preview available post-trial

### Resume AI
- Upload PDF/DOCX resumes
- Extract structured content
- ATS-style evaluation
- Keyword optimization suggestions
- Section-wise feedback

### Skill Gap Analysis
- Compares current profile vs target role
- Identifies missing skills
- Provides actionable improvement insights

### Jobs Match
- Filterable catalog (location, type, salary in INR, experience, skills, company type)
- Match scoring algorithm
- Save and apply workflows

### Roadmap
- Multi-week plans with tasks and milestones
- Task-based progression
- Milestone tracking
- Persistent user progress

### Mock Interviews
- Role-based and difficulty-based interviews
- AI-generated questions
- Voice input using browser Speech API
- Typed fallback for unsupported devices
- AI-based scoring and feedback
- Interview history tracking

### Dashboard UI
- Sidebar navigation
- Notifications system
- Profile management
- Pricing page for upgrades

## Theming

- Only dark theme is supported

## Tech stack

| Layer | Technologies |
|--------|----------------|
| Frontend | Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, Zustand, Framer Motion |
| Backend | FastAPI, SQLAlchemy, SQLite by default, JWT + refresh tokens |
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
.\\venv\\Scripts\\activate
pip install -r requirements.txt
```

Create `backend/.env`, then run:

```bash
uvicorn app.main:app --reload --port 8000
```

API docs are available at `http://localhost:8000/docs` while the backend is running.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

For a production build, validate the frontend with:

```bash
npm run lint
npm run build
```

## Environment variables

### Backend (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLAlchemy connection string. If omitted, the backend uses the local SQLite database `career_mentor.db`. |
| `SECRET_KEY` | Secret key used for signing and verifying authentication tokens. Use a strong value outside local development. |
| `GEMINI_API_KEY` | API key for Google Gemini, used by the AI layer for resume feedback, interview questions, skill analysis, and learning roadmaps. |

> Keep `backend/.env` local and never commit API keys or other secrets to the repository.

### Frontend (`frontend/.env.local`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API used by the Next.js client for authentication and career workflows. |

> Variables prefixed with `NEXT_PUBLIC_` are exposed to browser-side code, so do not place secrets in them.

## Folder structure

```text
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

## API entry points

The FastAPI application exposes these base endpoints:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` | Returns a small API welcome response. |
| GET | `/health` | Returns a basic health response with the current API version and database label. |
| GET | `/docs` | Opens the interactive Swagger UI generated by FastAPI. |
| GET | `/redoc` | Opens the alternative ReDoc API reference. |

Feature routers are mounted below the `/api/v1` prefix:

- `/api/v1/auth` — registration, login, refresh, and authentication flows.
- `/api/v1/resume` — resume upload and resume-analysis workflows.
- `/api/v1/jobs` — job browsing, matching, saving, and application workflows.
- `/api/v1/dashboard` — dashboard and account summary endpoints.
- `/api/v1/interview` — mock-interview sessions, answers, and feedback.

Use the generated Swagger UI to confirm the exact request body and response schema for each route before integrating a client.

## Usage

1. Start the **backend**, then the **frontend**.
2. Open `http://localhost:3000`, **register** (optionally `?trial=true` for a trial), or **log in**.
3. Use **Resume AI** with a target role, review ATS-style output and suggestions.
4. Explore **Skill Gap**, **Jobs Match** (filters, save, apply), **Roadmap**, and **Mock Interviews** from the sidebar.
5. For interviews: pick type and difficulty, press **Start Interview** or **Refresh questions**, answer by **microphone** (Chrome/Edge recommended) and/or **typed text**, then **Submit Answer** for feedback.

## Troubleshooting

- **The frontend cannot reach the API:** confirm that the backend is running on port `8000` and that `NEXT_PUBLIC_API_URL` points to that base URL.
- **The API starts but AI features fail:** check that `GEMINI_API_KEY` exists in `backend/.env`; do not place it in `frontend/.env.local`.
- **Authentication behaves unexpectedly after a configuration change:** remove stale browser storage/cookies, restart the backend, and sign in again.
- **Resume uploads fail immediately:** verify that the file is a supported PDF or DOCX and that the backend environment has the upload-related dependencies installed.
- **The browser blocks microphone access:** use HTTPS in deployed environments and grant microphone permission to the browser for mock interviews.
- **Database changes are not visible:** stop and restart the backend so the startup database initialization runs again.

## Deployment

### Backend

- Run `uvicorn` behind a process manager or container.
- Set a strong `SECRET_KEY`, production `DATABASE_URL` (for example, PostgreSQL), and `GEMINI_API_KEY`.
- Terminate TLS at your edge and restrict CORS to the frontend origin.

### Frontend

- Run `npm run build` followed by `npm start` for the production server, then deploy on Vercel or another Node.js host.
- Set `NEXT_PUBLIC_API_URL` to the public API URL.
- Ensure HTTPS in production so browser speech and secure cookies behave as expected.

## Future Improvements

- Payment integration (Stripe/Razorpay)
- Real-time interview simulation
- AI-powered job application automation
- Multi-language support
