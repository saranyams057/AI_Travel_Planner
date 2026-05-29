# WanderMind ✈️

> **AI-powered travel planning, end to end.** Describe a trip in plain English — WanderMind spins up six specialized agents, coordinates them through a LangGraph pipeline, and hands you a full plan: itinerary, transport, hotels, budget, weather forecast, and safety tips. All in one shot.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![LangGraph](https://img.shields.io/badge/LangGraph-multi--agent-FF6B35?style=flat)
![Groq](https://img.shields.io/badge/Groq-LLaMA3-F55036?style=flat)

---

## What is WanderMind?

Most "AI travel planners" are just a single LLM call dressed up in a nice UI. WanderMind is different — it runs a proper multi-agent pipeline where each agent owns a specific part of the problem:

- One agent researches the destination
- One builds a day-by-day itinerary against live weather data
- One handles transport and hotel recommendations (with photos)
- One estimates a realistic budget
- One does a final verification pass to catch hallucinations before anything reaches you

The output lands in a clean 6-tab React UI. No walls of text, no copy-pasting into your own notes.

---

## Tech Stack

| Layer | What's used |
|---|---|
| **LLM** | Groq (LLaMA 3 — fast inference) |
| **Agent orchestration** | LangGraph |
| **Backend** | FastAPI (Python 3.11+) |
| **Frontend** | React 18 + Vite |
| **Weather** | OpenWeatherMap API |
| **Photos** | Unsplash / Pexels |
| **Logging** | Structured JSON, rotating file logs |

---

## Agent Pipeline

```
User Input
    │
    ▼
┌─────────────────────┐
│    Orchestrator      │  ← breaks down the request, decides what each agent needs
└──────────┬──────────┘
           │
     ┌─────┴──────────────────────────────┐
     │                                    │
     ▼                                    ▼
Destination Discovery Agent       Itinerary Planner Agent
  - Key attractions                  - Day-by-day plan
  - Local culture/context            - Pulls live weather data
  - Best time to visit               - Adjusts for seasons/conditions
     │                                    │
     └────────────────┬───────────────────┘
                      │
           ┌──────────┴──────────┐
           │                     │
           ▼                     ▼
  Transport & Hotel Agent    Budget Estimator Agent
    - Flights overview          - Estimated costs per category
    - Hotel options             - Budget / mid-range / luxury tiers
    - Fetches photos            - Currency context
           │                     │
           └──────────┬──────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  Verification Agent   │  ← hallucination check, cross-validates facts
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  Orchestrator Final   │  ← assembles overview + precautions
           └──────────┬───────────┘
                      │
                      ▼
    ┌─────────────────────────────────────┐
    │         6-Tab React UI              │
    │  Overview · Itinerary · Transport   │
    │  Budget · Weather · Precautions     │
    └─────────────────────────────────────┘
```

---

## Project Structure

```
travel-assistant/
│
├── backend/
│   ├── main.py              # FastAPI app, routes, middleware
│   ├── graph.py             # LangGraph graph definition
│   ├── state.py             # Shared agent state (TypedDict)
│   ├── agents/
│   │   └── agents.py        # All 5 agent definitions
│   ├── tools/
│   │   └── tools.py         # Weather tool, image tool, etc.
│   ├── logs/                # Auto-created at runtime
│   │   ├── app.log
│   │   └── errors.log
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── ExplorePage.jsx
    │   │   └── PlanPage.jsx
    │   └── components/
    │       └── tabs/
    │           ├── OverviewTab.jsx
    │           ├── ItineraryTab.jsx
    │           ├── TransportTab.jsx
    │           ├── BudgetTab.jsx
    │           ├── WeatherTab.jsx
    │           └── PrecautionsTab.jsx
    ├── package.json
    └── .env.example
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/wandermind.git
cd wandermind
```

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Open .env and add your keys (GROQ_API_KEY is the only required one)

# Start the server
uvicorn main:app --reload --port 8000
```

Backend will be running at `http://localhost:8000`. Quick sanity check:

```bash
curl http://localhost:8000/health
```

### 3. Frontend setup

```bash
cd frontend

npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173` — you should see the landing page.

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Required
GROQ_API_KEY=your_groq_key_here

# Optional — enables live weather data in itinerary
OPENWEATHERMAP_API_KEY=

# Optional — one of these for destination photos
UNSPLASH_ACCESS_KEY=
PEXELS_API_KEY=
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
```

If the optional keys are missing, the app falls back gracefully — weather shows a placeholder, images are skipped. Core planning still works fine.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health check |
| `GET` | `/metrics` | Request counters + timing summaries |
| `POST` | `/plan` | Main planning endpoint — kicks off the agent pipeline |

Every response includes:
- `x-request-id` — unique ID for tracing
- `x-response-time-ms` — total processing time

---

## Observability

The backend emits structured JSON logs for every request and every agent step. Two log files are written automatically:

```
backend/logs/app.log        # all events
backend/logs/errors.log     # warnings and errors only
```

Both rotate at ~2 MB, keeping the last 5 backups. The `/metrics` endpoint exposes in-memory counters for HTTP routes and per-agent timings — useful if you want to see which agent is the slowest.

The frontend logs API timing, backend request IDs, and any JS errors to the browser's developer console.

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-idea`)
3. Make your changes and test them
4. Open a pull request with a clear description of what you changed and why

For bigger changes, open an issue first so we can discuss the approach before you spend time on it.

---

## Known Limitations

- **No streaming** — the full pipeline runs before anything shows on screen. Planning requests take 15–30s depending on Groq load. Streaming is on the roadmap.
- **In-memory metrics** — `/metrics` resets on server restart. No persistence yet.
- **Single trip at a time** — the current UI doesn't support saving or comparing multiple plans.

---

## License

MIT — do whatever you want with it, just don't remove the attribution.

---

*Built to show what a proper multi-agent pipeline looks like end-to-end — not just a wrapper around a single LLM call.*
