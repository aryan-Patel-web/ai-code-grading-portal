# ⚡ AI-Powered Code Grading & Doubt Resolution Portal

> **KPMG G&PS E&S Internship Assignment — GenAI Track**
> Built by Aryan Patel | Deployed: https://kpmg-frontend.onrender.com

---

## 📋 Problem Statement

Universities face two bottlenecks: **manual code grading is slow and inconsistent**, and **students wait days for doubt answers**. This portal solves both with AI:

1. **Code submitted → runs in Docker sandbox → graded against 5 test cases → Mistral AI writes feedback** — all in ~15 seconds
2. **Student posts doubt → Mistral drafts answer → Teacher must approve before any student sees it** — no unchecked AI output reaches students
3. **Every input scanned for prompt injection** — attacks are stripped, logged, and never reach the model unchanged

---

## 🛠 Tech Stack

| Layer | Technology | Role in this project |
|---|---|---|
| Frontend | React 18 + Vite | Student + teacher SPA |
| Routing | React Router DOM v6 | Client-side navigation |
| HTTP Client | Axios | API calls with JWT header |
| Backend | Express.js (Node 18) | REST API, all business logic |
| Database | MongoDB Atlas + Mongoose | Users, submissions, doubts, injection logs |
| Auth | JWT + bcryptjs | Secure login, role-based access |
| AI | Mistral AI `mistral-small-latest` | Code feedback + doubt answers |
| AI Client | Direct REST via Axios | No LangChain — custom retry + validation |
| Sandbox (local) | Docker `python:3.11-slim` + `node:18-alpine` | Isolated per-submission containers |
| Sandbox (Render) | Node `child_process.spawn` | Subprocess fallback when Docker unavailable |
| Deployment | Render (Web Service + Static Site) | Auto-deploy from GitHub |

> **Why no LangChain/LangGraph?** Direct Mistral REST calls are simpler, faster, and give full control over retry logic, prompt injection handling, and output validation. LangChain adds abstraction overhead for zero benefit in a focused single-model pipeline.

---

## 🚀 Live Links

| | URL |
|---|---|
| 🌐 Frontend | https://kpmg-frontend.onrender.com |
| 🔧 Backend API | https://kpmg-ai-backend.onrender.com |
| ❤️ Health Check | https://kpmg-ai-backend.onrender.com/api/health |

---

## 🔑 Demo Accounts

| Role | Username | Password |
|---|---|---|
| Student | `123` | (your password) |
| Teacher | `teacher1` | `teacher123` |

---

## ⚙️ Local Setup

```bash
git clone https://github.com/Aryan-Patel-web/ai-code-grading-portal
cd ai-code-grading-portal

# Backend
cd backend
cp .env.example .env
# Edit .env — fill MONGO_URI and MISTRAL_API_KEY
npm install
npm start

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev
# Open http://localhost:5173
```

### `.env` values needed
```
PORT=5000
MONGO_URI=mongodb+srv://...
MISTRAL_API_KEY=your_key_here
MISTRAL_MODEL=mistral-small-latest
SANDBOX_TIMEOUT_MS=10000
JWT_SECRET=any_long_random_string
NODE_SANDBOX_IMAGE=mirror.gcr.io/library/node:18-alpine
```

---

## ✅ Feature Checklist

### Core Requirements
- [x] Student submits Python or JavaScript code
- [x] Code runs in isolated Docker sandbox (`--rm --network none --memory 128m --cpus 0.5`)
- [x] Graded against 5 test cases (sum of two integers)
- [x] Test results stored in MongoDB per submission
- [x] Student posts coding doubts to shared board
- [x] Submission history with expandable test results

### Extended AI Requirements
- [x] Mistral AI code quality feedback (style, efficiency, correctness, summary JSON)
- [x] Mistral AI drafts answers to student doubts
- [x] Draft → Pending → Approved/Rejected state machine
- [x] Teacher approves, edits, or rejects each draft
- [x] DB-enforced state transitions (Mongoose enum + assertTransition())

### Security
- [x] 15-pattern prompt injection detection (regex)
- [x] Injection attempts logged to MongoDB InjectionLogs collection
- [x] Hardened system prompt in all Mistral calls
- [x] Output validation (HTML strip, 3000 char cap, bleed-through detection)
- [x] Per-submission Docker container with network isolation
- [x] JWT auth (8h expiry) + bcrypt password hashing
- [x] Mistral retry logic (2 retries, ECONNRESET/429/5xx handling)

---

## 📁 Structure

```
ai-code-grading-portal/
├── backend/src/
│   ├── server.js                  # Express + CORS
│   ├── db.js                      # MongoDB connect
│   ├── controllers/               # Business logic
│   ├── routes/                    # API endpoints
│   ├── models/                    # Mongoose schemas
│   └── services/
│       ├── sandboxService.js      # Docker + subprocess fallback
│       ├── graderService.js       # 5 test case runner
│       └── mistralService.js      # AI + injection defence
└── frontend/src/
    ├── App.jsx                    # Routes + auth state
    ├── api.js                     # Axios + JWT interceptor
    ├── components/                # Reusable UI
    └── pages/                     # Login, Submit, Doubt, Teacher, History, Logs
```

---

## 📝 Deployment Note


On **Render free tier**, Docker is not available. The sandbox falls back to running `python3`/`node` directly as a subprocess with a 10-second SIGKILL timeout. All other features work identically. The demo video (recorded locally) shows the full Docker sandbox in action.