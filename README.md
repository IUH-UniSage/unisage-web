# UniSage Web

Frontend for UniSage, an academic knowledge and support platform.

## Stack

- React 19, TypeScript, Vite
- React Router and TanStack Query
- Tailwind CSS 4, shadcn/ui (`radix-vega`), and `next-themes`
- React Hook Form and Zod
- Vitest, Testing Library, Storybook, and Playwright-ready tooling

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`.

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
npm run storybook
npm run storybook:build
```

## Foundation routes

- `/login` - sign in (`/auth/login` redirects here for compatibility)
- `/register` - account provisioning guidance (`/auth/register` redirects here)
- `/` - user home
- `/chat` - chat workspace
- `/ingester` - document ingestion dashboard
- `/admin` - System Admin overview

User, ingester, chat, and admin routes require a valid Backend session. The
frontend uses the Backend's `HttpOnly` access and refresh cookies and keeps only
non-secret selected-profile metadata in local storage.

Architecture decisions and the Stitch implementation map live in
`docs/architecture.md` and `docs/route-screen-matrix.md`.

The codebase follows feature-based boundaries: route pages stay thin, business
logic lives under `src/features`, shadcn primitives stay under
`src/components/ui`, and cross-feature components live under
`src/components/shared`.
