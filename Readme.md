# ⚡ AI-Powered Code Grading & Doubt Resolution Portal

> **KPMG G&PS E&S Internship Assignment — GenAI Track**
> Built by Aryan Patel 
> Deployed: https://kpmg-frontend.onrender.com

---

## 📋 Problem Statement

Universities and online learning platforms face a critical bottleneck: **manual code grading is slow, inconsistent, and doesn't scale.** Teaching assistants spend hours running student code, checking outputs, and writing feedback. Doubt resolution is even slower — students post questions and wait days for answers.

**This project solves both problems with AI:**

1. **Automated Code Grading** — Student submits code → runs in an isolated Docker sandbox → graded against 5 test cases → Mistral AI writes quality feedback (style, efficiency, correctness) — all in under 15 seconds.

2. **AI Doubt Resolution with Human Oversight** — Student posts a coding doubt → Mistral AI drafts an answer → Teacher reviews, edits, and approves before any student sees it. No unchecked AI answers ever reach students.

3. **Security First** — Every student input is scanned for prompt injection attacks before touching the AI. Every code submission runs in a container with `--network none` so it can't call the internet or access other files.

---

## 🛠 Tech Stack

| Layer | Technology | What it does in THIS project |
|---|---|---|
| **Frontend** | React 18 + Vite | SPA with student and teacher views |
| **Routing** | React Router DOM v6 | Client-side page navigation without reload |
| **HTTP Client** | Axios | Makes API calls to backend with JWT auth header |
| **Backend** | Express.js (Node 18) | REST API server, handles all business logic |
| **Module System** | ES Modules (`type: module`) | `import/export` syntax in Node backend |
| **Database** | MongoDB Atlas + Mongoose | Stores users, submissions, doubts, injection logs |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs | Secure login, password hashing, role-based access |
| **AI Model** | Mistral AI (`mistral-small-latest`) | Generates code feedback and doubt answers |
| **AI Client** | Direct REST via Axios | HTTP POST to `api.mistral.ai/v1/chat/completions` |
| **Code Sandbox** | Docker (`python:3.11-slim`, `node:18-alpine`) | Isolated per-submission containers |
| **Sandbox Fallback** | Node `child_process.spawn` | Runs code directly when Docker unavailable (Render) |
| **Deployment — Backend** | Render Web Service | Auto-deploys from GitHub on push |
| **Deployment — Frontend** | Render Static Site | Builds `npm run build`, serves `dist/` |
| **Environment Config** | dotenv | Loads `.env` for secrets (API keys, DB URI) |
| **Password Hashing** | bcryptjs | Salts + hashes passwords before storing |

### ❌ What I did NOT use (and why)
| Tool | Why not used |
|---|---|
| **LangChain / LangGraph** | Not needed — direct Mistral REST calls are simpler, faster, and have fewer moving parts. LangChain adds abstraction overhead that doesn't benefit a focused single-model pipeline. |
| **Mem0** | No persistent memory needed — each doubt/submission is independent. |
| **AI SDK** | Direct Axios calls give full control over retry logic, timeouts, and error handling. |
| **PostgreSQL / Prisma** | MongoDB fits better — submissions and doubts are document-shaped, not relational. |
| **Next.js** | React + Vite is simpler for a single SPA without SSR requirements. |

---

## 🏗 Architecture Overview

```
Student Browser
    │
    ▼
React + Vite (Frontend)
    │  JWT in Authorization header
    ▼
Express.js REST API (Backend)
    ├── /api/auth        → Register, Login, JWT verify
    ├── /api/submissions → Submit code, get history
    └── /api/doubts      → Post doubt, approve, reject
          │
          ├── MongoDB Atlas (Mongoose)
          │     ├── Users collection
          │     ├── Submissions collection  
          │     ├── Doubts collection
          │     └── InjectionLogs collection
          │
          ├── Sandbox Service
          │     ├── Docker (local) → python:3.11-slim / node:18-alpine
          │     └── subprocess fallback (Render deployment)
          │
          └── Mistral AI Service
                ├── sanitizeInput() → strip injection patterns
                ├── logInjectionAttempt() → save to MongoDB
                ├── callMistralWithRetry() → POST to Mistral API
                └── validateOutput() → strip HTML, check length
```

---

## 🚀 Live Deployment

| Service | URL |
|---|---|
| Frontend | https://kpmg-frontend.onrender.com |
| Backend API | https://kpmg-ai-backend.onrender.com |
| Health Check | https://kpmg-ai-backend.onrender.com/api/health |
| GitHub Repo | https://github.com/Aryan-Patel-web/ai-code-grading-portal |

---

## 🔑 Demo Accounts

| Role | Username | Password |
|---|---|---|
| Student | `123` | 123 |
| Teacher | `teacher1` | `teacher123` |

---

## ⚙️ Local Setup

```bash
# 1. Clone
git clone https://github.com/Aryan-Patel-web/ai-code-grading-portal
cd ai-code-grading-portal

# 2. Backend
cd backend
cp .env.example .env
# Fill in MONGO_URI, MISTRAL_API_KEY
npm install
npm start

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev

# 4. Open http://localhost:5173
```

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb+srv://...
MISTRAL_API_KEY=your_key_here
MISTRAL_MODEL=mistral-small-latest
SANDBOX_TIMEOUT_MS=10000
JWT_SECRET=your_secret_here
NODE_SANDBOX_IMAGE=mirror.gcr.io/library/node:18-alpine
```

---

## ✅ Features Implemented

### Core (Assignment Requirements)
- [x] Student submits Python or JavaScript code
- [x] Code runs against 5 hardcoded test cases (sum of two integers)
- [x] Test results stored in MongoDB per submission
- [x] Student posts coding doubts to shared board
- [x] Submission history with pass/fail per test case

### Extended AI Requirements
- [x] Mistral AI generates code quality feedback (style, efficiency, correctness, summary)
- [x] Mistral AI drafts answers to student doubts
- [x] Draft → Pending → Approved/Rejected state machine
- [x] Teacher can approve, edit draft, or reject
- [x] DB-enforced state transitions (Mongoose enum + controller validation)

### Security
- [x] Prompt injection detection (15 regex patterns)
- [x] Injection attempt logging to MongoDB
- [x] Hardened system prompt in Mistral calls
- [x] Output validation before storing (HTML strip, length cap, bleed-through check)
- [x] Docker sandbox: `--rm`, `--network none`, `--memory 128m`, `--cpus 0.5`
- [x] JWT authentication with 8h expiry
- [x] bcrypt password hashing

---

## 📁 Project Structure

```
ai-code-grading-portal/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express app, CORS, routes
│   │   ├── db.js                  # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── submissionController.js
│   │   │   └── doubtController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── submissions.js
│   │   │   └── doubts.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Submission.js
│   │   │   ├── Doubt.js
│   │   │   └── InjectionLog.js
│   │   ├── services/
│   │   │   ├── sandboxService.js  # Docker + subprocess fallback
│   │   │   ├── graderService.js   # Test case runner
│   │   │   └── mistralService.js  # AI integration + injection defence
│   │   └── middleware/
│   │       ├── auth.js            # JWT verify middleware
│   │       └── errorHandler.js
│   └── Dockerfile.sandbox
└── frontend/
    └── src/
        ├── App.jsx
        ├── api.js                 # Axios instance with JWT interceptor
        ├── components/
        │   ├── CodeEditor.jsx
        │   ├── DoubtCard.jsx
        │   ├── DoubtForm.jsx
        │   ├── MarkdownRenderer.jsx
        │   └── TestResultCard.jsx
        └── pages/
            ├── Login.jsx
            ├── SubmitCode.jsx
            ├── DoubtBoard.jsx
            ├── TeacherDashboard.jsx
            ├── SubmissionHistory.jsx
            └── InjectionLogs.jsx
```

---

## 🔒 Sandbox Note


On **Render free tier**, Docker is not available. The sandbox falls back to running `python3`/`node` directly as a subprocess with a 10-second SIGKILL timeout. All other features work identically. The demo video (recorded locally) shows the full Docker sandbox in action.
