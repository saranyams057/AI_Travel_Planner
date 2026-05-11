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
