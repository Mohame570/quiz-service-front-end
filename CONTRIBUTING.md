# Contributing Guide (Frontend)

This document defines how contributors build features in the PitIQ frontend repository so merges stay clean and newcomers can pick up work quickly.

## Stack / direction

- Next.js (App Router) + React 19 + TypeScript + Tailwind CSS 4
- UI conventions: see `DESIGN.md`
- Do not introduce backend-specific logic here. The backend lives in `quiz-service-internship-round-1-back-end`.

## Core rules

- Never edit `node_modules/` or commit it.
- Do not commit build output (for example `.next/`).
- Do not commit secrets. Copy `.env.example` to `.env.local` and fill locally.
- Keep PR scope focused. No refactors unrelated to the feature.
- When a task touches backend contracts, coordinate with backend owners and update matching docs in `quiz-service-internship-round-1-back-end/docs/api/`.

## Branch naming (recommended)

Use:

```text
PITIQ-FE-L#xx-feature-name
```

- `#` = learner number (`L1` … `L7`), matching the backend workflow.
- `xx` = sprint number (`01`, `02`, …).
- `feature-name` = short kebab-case.

Examples:

- `PITIQ-FE-L102-auth-session-hardening`
- `PITIQ-FE-L602-student-dashboard-polish`

## Repo layout conventions

- `app/` holds route files (`page.tsx`, `layout.tsx`) only.
- `components/ui/` holds reusable UI primitives (shared across features).
- `components/shared/` holds shared app pieces (navigation/layout/providers).
- Feature-specific UI can live in feature folders under `components/` (for example `components/admin/`, `components/student/`, `components/invitation/`).
- Keep API logic in `lib/api/*` and session logic in `lib/auth/*`.
- Validation belongs in `lib/validation.ts` using Zod.

## Quality gates (minimum)

- `npm run lint`
- `npm run build`

## Backend contract pairing checklist

If your FE feature consumes new BE endpoints or changes request/response shapes:

1. Update or add a backend API contract doc (`quiz-service-internship-round-1-back-end/docs/api/*`).
2. Ensure your FE uses the correct path and auth expectation.
3. Add graceful UI empty/error states (no stack traces, no blank screens).

## Docker / local dev (Docker not yet implemented — see TASK-I1)

- Local development: `npm install` + `npm run dev`
- `API_REWRITE_TARGET` env var controls where browser `/api/*` requests are proxied (default `http://localhost:3002`).
- Docker support is a pending task (TASK-I1 in `PitIQ-stuff/Intern-Task-Bank.md`).

