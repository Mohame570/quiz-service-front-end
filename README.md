# Quiz Service Frontend

This repository is the frontend foundation for the internship quiz platform.
The frontend stack is now locked to `Next.js + React + TypeScript + Tailwind CSS`.

For Sprint 1, `main` must stay a shared foundation branch only. It should contain the project structure, tooling, conventions, and minimal app shell, but not anyone's feature implementation.

For the day-to-day feature workflow, branch naming, PR rules, and documentation process, see `CONTRIBUTING.md`.

## Locked Technical Direction

- Framework: `Next.js 16.2.9`
- Runtime: `Node.js 20+`
- Language: `TypeScript`
- UI Library: `React 19`
- Styling: `Tailwind CSS 4`
- Linting: `ESLint 9`
- Design System: See `DESIGN.md`

## Main Branch Contract

### Safe on `main`

- shared frontend repo structure
- Next.js application bootstrap with App Router
- shared TypeScript configuration and build setup
- shared ESLint configuration
- design system and color palette (DESIGN.md)
- empty component folders for team ownership (`/components/quiz`, `/components/ui`, `/components/shared`)
- shared layout and global styles
- empty page folders for feature routes
- local dev tooling such as `.env.example` and npm scripts

### Must stay off `main`

- real feature components or pages
- business logic tied to quiz-specific features
- API route handlers or data fetching logic
- Authentication or user state management implementation
- Quiz creation, attempt, or results page implementations
- Admin dashboard feature code
- feature-specific utility functions or hooks

## Sprint 1 Dependency Rules

- Frontend features depend on backend API contracts. Coordinate with backend L3 (Prisma schema) for quiz, question, and attempt models.
- Quiz list, quiz display, and attempt UI should align on shared component patterns early.
- Admin dashboard can move in parallel once the quiz data model is stable.
- UI components in `/components/ui` should be reusable across all features.

## Recommended Team Workflow

1. Keep this scaffold on `main`.
2. Every owner branches from `main` for their feature.
3. Document new API endpoints your feature needs in the PR description or a dedicated `docs/` folder.
4. Reuse components from `/components/ui` and `/components/shared` before creating feature-specific ones.
5. If a new shared component pattern emerges, propose it in `/components/ui` for other team members to use.

## Canonical Project Layout

```text
.
├── .editorconfig
├── .env.example
├── .gitignore
├── .nvmrc
├── README.md
├── DESIGN.md
├── next.config.ts
├── next-env.d.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
├── package.json
├── package-lock.json
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── admin/
│   │   └── dashboard/
│   │       └── page.tsx
├── components/
│   ├── quiz/
│   │   ├── QuizList.tsx
│   │   └── QuizCard.tsx
│   ├── ui/
│   │   └── .gitkeep
│   └── shared/
│       └── .gitkeep
├── constants/
│   └── .gitkeep
├── public/
│   └── .gitkeep
```

## File And Folder Roles

This section is the source of truth for what goes where.

### Root files

- `README.md`: the team contract for structure, ownership boundaries, and local setup.
- `DESIGN.md`: the shared visual language, color palette, and UI conventions.
- `.gitignore`: ignores node_modules, build output, and local-only files.
- `.env.example`: the shared list of frontend environment variables (API endpoints, etc).
- `.nvmrc`: recommended Node version for the team.
- `.editorconfig`: shared editor whitespace rules.
- `next.config.ts`: Next.js configuration for routing, image optimization, and build behavior.
- `tsconfig.json`: TypeScript compiler rules for development and builds.
- `eslint.config.mjs`: shared lint rules for the TypeScript/React codebase.
- `postcss.config.mjs`: PostCSS configuration for Tailwind CSS processing.
- `package.json`: dependency list, scripts, engines, and package metadata.
- `package-lock.json`: npm lockfile so the team installs the same dependency graph.

### `app/`

`app/` is the Next.js App Router source root. All pages and layouts belong here.

- `app/layout.tsx`: root layout that wraps all pages. Contains the global `<html>` tag and shared UI structure.
- `app/page.tsx`: home page.
- `app/globals.css`: global styles applied to the entire app.

What belongs here:

- page files (`page.tsx`)
- layout files (`layout.tsx`)
- route groups if needed
- API routes if backend is unavailable

What does not belong here:

- component implementation details (use `/components` instead)
- reusable UI building blocks (use `/components/ui` instead)

### `components/`

`components/` contains all reusable React components, organized by responsibility.

#### `components/ui/`

- Global, reusable UI building blocks used across multiple features.
- Examples: Button, Card, Modal, Input, Form components.
- No feature-specific business logic.
- Can be shared across quiz, admin, and other sections.

Put here:

- generic UI components
- shared design system components
- accessibility-focused base components

Do not put here:

- feature-specific components
- business logic or data fetching
- quiz or admin related UI

#### `components/quiz/`

- Quiz-related feature components.
- Current ownership: depends on Sprint 1 assignment.
- Examples: QuizList, QuizCard, QuizDetail.

#### `components/shared/`

- Shared utility components and patterns used across features but not generic UI.
- Examples: layout wrappers, navigation patterns, feature-specific helpers.

### `constants/`

- Application-wide constants: magic strings, API endpoint prefixes, config values.
- Do not mix with feature-specific constants; those belong with their components.

### `public/`

- Static assets: images, icons, fonts (if not using CDN).
- Served directly by Next.js without processing.

## Getting Started

### Prerequisites

- Node.js 20+ (check `.nvmrc`)
- npm or yarn

### Installation

```bash
# Clone and install dependencies
npm install

# Copy environment template (ask team lead for actual values)
cp .env.example .env.local
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Docker

A Dockerfile for this app is tracked in the task bank as **TASK-I1** (see `PitIQ-stuff/Intern-Task-Bank.md`).
It has not been implemented yet. Use `npm run dev` locally against the backend Docker Compose stack.

### Build & Deploy

```bash
npm run build
npm start
```

## Scripts

- `npm run dev` — Start development server with hot reload
- `npm run build` — Build for production
- `npm start` — Start production server
- `npm run lint` — Run ESLint on the codebase

## Design System

The frontend uses a purple-based dark theme. See `DESIGN.md` for the complete color palette, typography, and component patterns.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
