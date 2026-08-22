# UniSage Web

Frontend for UniSage, an academic knowledge and student-support platform, built with React 19 and
Vite. This is the initialization scaffold: tooling, base UI kit, folder structure, and placeholder
routes/pages. Real feature logic (auth, access control, business workflows) lands in follow-up
branches.

## Requirements

- **Node.js**: latest LTS (currently Node.js 24)
- **Package manager**: [pnpm](https://pnpm.io/) (pinned via `packageManager` in `package.json`) —
  no npm/yarn
- **Git**

## Setup

### 1. Clone the project

```bash
git clone <repository-url>
cd unisage-web
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

Create `.env.local` from `.env.example` and fill in the values you need:

```bash
cp .env.example .env.local
```

On PowerShell, use `Copy-Item .env.example .env.local` instead.

## Running the project

### Development

```bash
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it.

### Production build

```bash
pnpm run build
pnpm run preview
```

### Other commands

```bash
pnpm run lint          # Lint check
pnpm run format        # Auto-format with Prettier
pnpm run format:check  # Check formatting only
pnpm run typecheck     # TypeScript project check
pnpm run test          # Vitest, single run
pnpm run test:watch    # Vitest, watch mode
pnpm run test:coverage # Vitest with coverage
pnpm run test:e2e      # Playwright
pnpm run storybook     # Component workshop on port 6006
```

## Folder structure

```
unisage-web/
├── public/                        # Static assets (favicon, logos, ...)
│
├── src/
│   ├── app/                       # App-level composition: providers, route fallback
│   ├── assets/                    # Static assets imported by components
│   ├── components/
│   │   ├── ui/                    # shadcn primitives (generated, no business logic)
│   │   └── shared/                # Cross-feature composed components
│   ├── constants/                 # Route paths, TanStack Query cache policies
│   ├── features/                  # Feature modules (components/hooks/api per feature)
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── access-control/
│   │   └── ...                    # knowledge, ingestion, users, analytics, ...
│   ├── hooks/                     # Generic reusable hooks
│   ├── layouts/                   # Route-level layout shells
│   ├── lib/                       # Framework integration: axios client, query client, cn()
│   ├── pages/                     # Thin route entry components that compose features
│   ├── routes/                    # Route definitions per area (auth/user/ingester/admin)
│   ├── styles/                    # Tailwind entry stylesheet and design tokens
│   ├── test/                      # Vitest setup, fixtures, and mocks
│   └── utils/                     # Pure utility functions (date, uuid, file-size, storage)
│
├── e2e/                           # Playwright specs
├── docs/architecture.md           # Folder-structure and layering conventions
├── .storybook/                    # Storybook config
├── .devcontainer/                 # Dev Container config (VS Code / Codespaces)
├── .env.example                   # Environment variable template
├── components.json                # shadcn/ui config
├── eslint.config.js               # ESLint (flat config)
├── vite.config.ts                 # Vite config
├── tsconfig*.json                 # TypeScript config
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

See [docs/architecture.md](docs/architecture.md) for layering conventions,
[docs/testing.md](docs/testing.md) for what to test at which layer, and [AGENTS.md](AGENTS.md) for
the full set of project rules agents should follow.

## Main libraries

### Core framework & UI

- **[React 19](https://react.dev/)** + **[Vite](https://vite.dev/)**
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Tailwind CSS v4](https://tailwindcss.com/)**
- **[radix-ui](https://www.radix-ui.com/)** — headless primitives behind the shadcn-style UI kit

### State management & data fetching

- **[TanStack Query v5](https://tanstack.com/query/latest)** — server state, cache policies in
  `src/constants/query-policies.ts`
- **[Axios](https://axios-http.com/)** — HTTP client (`src/lib/axios-client.ts`)

### UI components & styling

- **shadcn-ui** conventions (`src/components/ui/`) — see `.agents/skills/shadcn-ui/`
- **[Lucide React](https://lucide.dev/)** — icons
- **[next-themes](https://github.com/pacocoursey/next-themes)** — dark/light theme switching
- **[Sonner](https://sonner.emilkowal.ski/)** — toast notifications
- **[class-variance-authority](https://cva.style/docs)**, **[tailwind-merge](https://github.com/dcastil/tailwind-merge)**,
  **[clsx](https://github.com/lukeed/clsx)** — variant and class-name utilities
- **[Framer Motion](https://motion.dev/)** — animation

### Forms

- **[React Hook Form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)** via
  `@hookform/resolvers`

### Routing

- **[React Router v7](https://reactrouter.com/)**

### Development & testing tools

- **[ESLint](https://eslint.org/)** (flat config) + **typescript-eslint**
- **[Prettier](https://prettier.io/)** + `prettier-plugin-tailwindcss`
- **[Vitest](https://vitest.dev/)** + **Testing Library** + **jsdom** + **msw**
- **[Playwright](https://playwright.dev/)** — e2e tests
- **[Storybook](https://storybook.js.org/)** — component workshop
- **[Husky](https://typicode.github.io/husky/)** + **lint-staged** — pre-commit checks

## Routes (scaffold)

- `/` — user home
- `/chat` — chat workspace
- `/login`, `/register` — authentication
- `/ingester` — ingestion dashboard
- `/admin` — system administration overview

Auth/permission guards, API integration, and feature business logic are intentionally out of
scope for this initialization branch and land in follow-up feature branches.

## Dev Container

`.devcontainer/` provides a ready-to-use VS Code Dev Container / GitHub Codespaces environment
(Node 24, pnpm via corepack, common CLI tooling, and the `claude`/`codex`/`opencode` agent CLIs).
Copy `.devcontainer/post-create.local.sh.example` to `.devcontainer/post-create.local.sh` for any
machine-specific setup (it's gitignored).

## Contributing

Follow [AGENTS.md](AGENTS.md) and `.agents/skills/git-commit-instructions/SKILL.md` for branch
naming, commit format, and the pull request workflow (`.agents/skills/pr/SKILL.md`,
`.github/pull_request_template.md`).
