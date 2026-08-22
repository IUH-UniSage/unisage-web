# AGENTS.md

Instructions for AI agents (Claude Code and others) working in this repository.

## Project

UniSage Web — the frontend for UniSage, an academic knowledge and
student-support platform. See [README.md](README.md) for the stack and
getting-started commands, and [docs/architecture.md](docs/architecture.md)
for folder-structure conventions.

## Git workflow

Before any branch, commit, or PR operation, apply
`.agents/skills/git-commit-instructions/SKILL.md`. It defines:

- Branch naming: `<feature|fix|enhance>/<huy|huyen>-unisage-<task-number>-<short-name>`.
- Commit message format (type(scope): [UNISAGE-N] outcome, with
  Context/Changes/Verification sections).
- `main` stays common-only: repository skills, GitHub metadata, hooks, and
  shared policy files — no application source, framework config, dependencies,
  tests, or build output.
- Never commit or push without explicit instruction; never force-push or
  rewrite pushed history without explicit approval.

Also apply `.agents/skills/git-guardian/SKILL.md` before staging anything, and
`.agents/skills/pr/SKILL.md` when opening a pull request (uses
`.github/pull_request_template.md`).

## Frontend skills

When working under `src/`, consult the relevant skill before diverging from
established patterns:

- `.agents/skills/react-best-practices/` — performance, rendering, and
  data-fetching rules.
- `.agents/skills/composition-patterns/` — component API and state-sharing
  patterns.
- `.agents/skills/react-components/` and `.agents/skills/shadcn-ui/` —
  component conventions and the shadcn primitive catalog.
- `.agents/skills/tanstack-query/` — query key structure, caching, and
  mutation rules.
- `.agents/skills/playwright/` and `.agents/skills/storybook-setup/` — e2e
  and component-story conventions.
- `.agents/skills/frontend-design-review/` — checklist for reviewing UI
  changes.

## Verification

Match checks to the scope of the change (see the git-commit-instructions
verification matrix):

- Skills or PR templates: `quick_validate.py` for each skill, plus
  `git diff --check`.
- React logic or components: `pnpm run test`, `pnpm run lint`, `pnpm run build`.
- Routes, auth, permissions, or user interaction: also `pnpm run test:e2e`.

Never claim a check ran when it did not.
