# Project 6 — Gatehouse Authentication & Authorization

Student: Anant Sinha | Roll No: 23BCON1670 | Section: P | Semester: VII

This project implements Experiment 6 from the WEB DEVELOPMENT USING AI lab record: user registration/login and role-based authorization using Express.js and MongoDB.

## Stack (as required)
- Node.js + Express.js 5 API
- MongoDB + Mongoose 9 (persistent database, **not** in-memory)
- bcryptjs for password hashing (cost 10)
- jsonwebtoken for signed JWTs (1-hour expiry)
- React 19 + Next.js 16 frontend
- TypeScript + Tailwind CSS 4
- CORS

## Features
- Register with name/email/password; normalized lowercase unique email
- Login; generic invalid-credentials error
- Password hashes excluded by default and never sent in safe user responses
- `GET /api/auth/me` protected by JWT bearer authentication
- `GET /api/users` admin-only
- `DELETE /api/users/:id` admin-only; blocks deleting current admin
- Role-check middleware (`401` unauthenticated, `403` unauthorized role)
- Seed demo accounts only after database connects, and only if they don't already exist
- Responsive login/register, profile panel, admin directory and inline status/errors


## Demo credentials
Admin: `admin@gatehouse.demo` / `AdminPass123!`  
Regular user: `user@gatehouse.demo` / `UserPass123!`

Demo accounts are intended for local lab testing only.

## Setup on Windows

### Prerequisite
Install and start MongoDB Community Server locally (or use a MongoDB Atlas connection URI). This project requires a real MongoDB connection. Data persists between server restarts.

### 1) Backend
Open PowerShell in the `server` directory:
```powershell
npm install
Copy-Item .env.example .env
```
Edit `server/.env` and set a long random `JWT_SECRET` (minimum 24 characters). For local MongoDB, the example URI is:
`mongodb://127.0.0.1:27017/gatehouse_auth`

Then run:
```powershell
npm run dev
```
Expected API address: `http://localhost:4000`

### 2) Frontend
Open a **second** PowerShell terminal in the `client` directory:
```powershell
npm install
Copy-Item .env.local.example .env.local
npm run dev
```
Open `http://localhost:3000`.

## API reference
| Method | Route | Permission |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Valid JWT |
| GET | `/api/users` | Admin |
| DELETE | `/api/users/:id` | Admin, self-delete blocked |
| GET | `/api/health` | Public |

## Suggested lab test sequence
1. Register a new account.
2. Sign out and log in with the new account.
3. Call `/api/auth/me` with no token (expect 401), then with token (expect profile).
4. As a normal user, call `GET /api/users` (expect 403).
5. Log in with admin demo credentials and view user list.
6. Delete a test account; confirm admin self-delete is blocked.
7. Check that API responses contain no `passwordHash`.

> Educational demonstration only. localStorage token storage and demo credentials are not intended as production security recommendations.
