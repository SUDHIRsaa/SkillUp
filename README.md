# SkillUp

Aptitude & Competitive Coding Platform for students and admins. Full-stack MERN app.

## Features

- Daily aptitude questions
- Performance tracking
-- Competitive coding (removed in this deployment)
-- Leaderboards
-- Admin dashboard, moderation, analytics

## Quickstart

Prereqs: Node 18+, MongoDB running locally, PowerShell on Windows.

1. Server

- Copy `.env` to project root if not present. Minimal example:
  - DB_URI=mongodb://127.0.0.1:27017/skillup
  - JWT_SECRET=change-me
- Start API: `npm --prefix server run start`
- Health: <http://localhost:4000/api/health>

2. Client

- Install deps once: `npm --prefix client install`
- Dev server: `npm --prefix client run dev` → open URL shown (e.g., <http://localhost:5175>)
- Production build: `npm --prefix client run build` then `npm --prefix client run preview`

3. Competitive coding

- Competitive coding / Judge0 integration is not available in this deployment.

## Notes

-- Role-based routes are enforced on the server and client.
- Shared UI components live under `client/src/components/ui`.
