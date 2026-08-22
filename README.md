# UniSage Web

Frontend for UniSage, an academic knowledge and student-support platform.

## Stack

- React 19, TypeScript, Vite
- React Router v7, TanStack Query v5
- Tailwind CSS v4, shadcn-ui (radix-ui based), `next-themes`
- React Hook Form + Zod
- Vitest, Testing Library, Storybook, Playwright

## Getting started

```bash
pnpm install
cp .env.example .env.local
pnpm run dev
```

On PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`.

## Scripts

```bash
pnpm run dev
pnpm run typecheck
pnpm run lint
pnpm run format
pnpm run test
pnpm run test:e2e
pnpm run build
pnpm run storybook
```

## Routes (scaffold)

- `/` - user home
- `/chat` - chat workspace
- `/login`, `/register` - authentication
- `/ingester` - ingestion dashboard
- `/admin` - system administration overview

This is the initialization scaffold: tooling, base UI kit, folder structure,
and placeholder routes/pages. Real feature logic (auth, access control,
business workflows) lands in follow-up branches.

See `docs/architecture.md` for folder-structure conventions.
