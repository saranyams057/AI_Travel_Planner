# 🌍 WanderMind — AI Travel Assistant

A full-stack multi-agent travel planning website built with **LangGraph + Groq + React**.

## 🚀 Quick Start

### Step 1 — Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GROQ_API_KEY (required)
uvicorn main:app --reload --port 8000
```

## Observability

The backend emits structured JSON logs for every request and every LangGraph agent step. Each request gets an `x-request-id` response header and an `x-response-time-ms` duration header.

Persistent log files are written to:

- `backend/logs/app.log` for all app events
- `backend/logs/errors.log` for warnings and errors

Both files rotate automatically at about 2 MB, keeping 5 backups.

Useful endpoints:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/metrics
```

The `/metrics` endpoint returns in-memory counters and timing summaries for HTTP routes and agent runs. The frontend also logs API timing, backend request IDs, and browser errors to the developer console.

### Step 2 — Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

## 🔑 API Keys

| Key | Required | Get it at |
|---|---|---|
| GROQ_API_KEY | ✅ Yes | https://console.groq.com |
| OPENWEATHERMAP_API_KEY | Optional | https://openweathermap.org/api |
| UNSPLASH_ACCESS_KEY | Optional | https://unsplash.com/developers |
| PEXELS_API_KEY | Optional | https://www.pexels.com/api |

## 🤖 Agent Pipeline

```
User Input → Orchestrator
  ├── Destination Discovery Agent
  ├── Itinerary Planner Agent ← Weather Tool
  ├── Transport & Hotel Agent ← Image Tool
  └── Budget Estimator Agent
       ↓
  Verification Agent (hallucination check)
       ↓
  Orchestrator Final (Overview + Precautions)
       ↓
  6-Tab UI: Overview | Itinerary | Transport | Budget | Weather | Precautions
```

## 📁 Structure

```
travel-assistant/
├── backend/          FastAPI + LangGraph agents
│   ├── main.py
│   ├── graph.py
│   ├── state.py
│   ├── agents/agents.py
│   ├── tools/tools.py
│   └── requirements.txt
└── frontend/         React + Vite
    └── src/
        ├── pages/    LandingPage, ExplorePage, PlanPage
        └── components/tabs/   6 output tabs
```
