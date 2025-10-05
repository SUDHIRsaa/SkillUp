# SkillUp

Aptitude & Competitive Coding Platform for students and admins. Full-stack MERN app.

## Features

- Daily aptitude questions
- Performance tracking
- Competitive coding (Judge0 API)
- Leaderboards
- OTP authentication
- Admin dashboard, moderation, analytics

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

3. Judge0 (optional)

- To enable real code execution, set these in `.env` (root or `server/.env`):
  - `JUDGE0_URL` = `https://judge0-ce.p.rapidapi.com`
  - `JUDGE0_API_KEY` = your RapidAPI key
  The server will automatically add the required `X-RapidAPI-Key` and `X-RapidAPI-Host` headers. If not set, a mock result is returned so the UI still works.

## Notes

- Role-based routes are enforced on the server and client.
- OTP can be delivered via email/SMS when credentials are configured; otherwise use console logs/mocks.
- Shared UI components live under `client/src/components/ui`.
