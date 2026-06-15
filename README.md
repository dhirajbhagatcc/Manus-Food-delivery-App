# 🎯 ApplyTrack

A personal, AI-assisted **job application tracker** with **daily remote-job sourcing** — built for Dhiraj Bhagat.

- **Pipeline board** — Wishlist → Applied → Interviewing → Offer → Rejected, with drag & drop.
- **Add a job** by pasting a URL or text — Claude extracts title, company, location, salary, and a summary.
- **Generate Kit** on any card — a tailored cover letter, rewritten resume bullets, five likely interview questions, and a one-page company brief.
- **Discover** — every morning the app sources remote jobs worldwide, scores them against your resume on three axes (**match**, **AI-driven**, **AI-resistant**), drops matches into an inbox, and emails you a digest.
- Clean, modern UI. Single-password login. SQLite storage.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind + @dnd-kit |
| Backend | Node + Express + TypeScript |
| Database | SQLite (Node's built-in `node:sqlite`, needs **Node ≥ 22.5**) |
| AI | Claude via `@anthropic-ai/sdk` |
| Job sources | Remotive + RemoteOK (no key) + Adzuna (free key) |
| Email digest | Nodemailer (Gmail App Password or any SMTP) |
| Scheduler | `node-cron` |

The Claude API key lives **only on the backend** — it is never shipped to the browser.

---

## Local development

```bash
# 1. Install everything
npm run install:all

# 2. Configure env
cp .env.example backend/.env
#   then edit backend/.env — at minimum set LOGIN_PASSWORD and ANTHROPIC_API_KEY

# 3. (Optional) seed your profile/resume
npm run seed --prefix backend

# 4. Run backend (port 4000) and frontend (port 5173) in two terminals
npm run dev:backend
npm run dev:frontend
```

Open http://localhost:5173 — the Vite dev server proxies `/api` to the backend.

### Production build (single server)

```bash
npm run build      # builds frontend, then backend
npm run start      # backend serves the API AND the built frontend on PORT
```

---

## Environment variables

See [`.env.example`](./.env.example). Highlights:

| Var | Purpose |
|---|---|
| `LOGIN_PASSWORD` | The single password to access the app |
| `SESSION_SECRET` | Random string used to sign the session cookie |
| `ANTHROPIC_API_KEY` | From https://platform.claude.com/workspaces — enables all AI features |
| `ANTHROPIC_MODEL` | Defaults to `claude-sonnet-4-6` |
| `DATABASE_PATH` | SQLite file path (point at a persistent disk in prod) |
| `ADZUNA_APP_ID` / `ADZUNA_KEY` | Free key from https://developer.adzuna.com/ (optional, adds breadth) |
| `SMTP_*` / `DIGEST_TO` | Daily email digest (optional) |
| `DAILY_CRON` | When the daily sourcing runs (default `0 7 * * *`) |
| `APP_URL` | Public URL used in digest email links |

The app **degrades gracefully**: without an Anthropic key, AI features return a clear error and Discover still lists (unscored) jobs; without SMTP, the digest is simply skipped.

---

## Deploy to Render (recommended)

SQLite + the daily scheduler need an **always-on host with a persistent disk** (so **not** Vercel/Netlify).

1. Push this repo to GitHub.
2. In Render → **New → Blueprint**, pick this repo. It reads [`render.yaml`](./render.yaml) which provisions a web service with a 1 GB disk mounted at `/var/data`.
3. In the dashboard, fill the secret env vars (`LOGIN_PASSWORD`, `ANTHROPIC_API_KEY`, optional `ADZUNA_*`, `SMTP_*`, `DIGEST_TO`, `APP_URL`).
4. Deploy. Visit the URL, sign in, open **Profile**, and confirm your resume is there (or paste it).

> A persistent disk requires a paid Render instance type; the free tier sleeps and has no disk, which would wipe the database.

Other hosts with a persistent volume (Fly.io, Railway) work the same way — just set the env vars and mount a disk for `DATABASE_PATH`.

---

## How the daily Discover run works

```
fetch (Remotive + RemoteOK + Adzuna)
  → de-duplicate vs. what we've already seen
  → keep likely-remote roles
  → Claude scores each (match / AI-driven / AI-resistant) against your resume
  → keep the top matches as "new" discoveries
  → email a digest
```

Trigger it manually anytime with **Refresh jobs now** on the Discover tab.

---

## Project layout

```
backend/
  src/
    index.ts            Express app + static serving + cron
    db.ts  repo.ts      SQLite schema & queries
    auth.ts             Password gate + signed cookie
    anthropic.ts        Claude client helpers
    routes/             auth, jobs, profile, kit, discover
    services/
      extract.ts        URL/text → job fields (Claude)
      scoring.ts        Batch match/AI scoring (Claude)
      kit.ts            Cover letter / bullets / questions / brief
      digest.ts         Email digest
      discover.ts       Daily pipeline orchestration
      sources/          remotive, remoteok, adzuna
    seed.ts             Seed Dhiraj's profile
frontend/
  src/
    App.tsx             Shell, auth gating, tabs
    components/         Board, Column, JobCard, CardDrawer, KitPanel,
                        AddJobModal, Discover, Profile, Login
```

---

## Notes & caveats

- Free job APIs don't cover every board (no LinkedIn). The URL/text add flow covers anything Discover misses.
- Salary data is inconsistent across boards — unknown-salary jobs are flagged, not silently dropped.
- AI-driven / AI-resistant scores are Claude's judgment — guidance, not gospel.
