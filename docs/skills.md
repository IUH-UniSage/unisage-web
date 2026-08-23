# Skills

A **Skill** is a packaged set of instructions Claude Code loads on demand, instead of everything
living permanently in [AGENTS.md](../AGENTS.md)/[CLAUDE.md](../CLAUDE.md) (which loads on every
turn). Skills live at `.claude/skills/<folder>/SKILL.md`:

- **Frontmatter** (`name`, `description`) — the `description` is what Claude Code matches against
  the current task to decide when to pull the skill into context automatically. It's also what
  shows up when you type `/` in the slash-command menu.
- **Body** — the actual instructions, rules, or workflow steps, loaded only when the skill is
  triggered (by name, by `/command`, or by relevance) — not on every turn.
- **Supporting files** (optional) — subfolders like `rules/`, `resources/`, `references/`,
  `examples/`, `scripts/` that the body points into for detail kept out of the main context until
  actually needed. Several skills here (`react-best-practices`, `tanstack-query`,
  `composition-patterns`) split dozens of individual rule files this way instead of one giant
  `SKILL.md`.

> Note: a skill's frontmatter `name` doesn't always match its folder name — several were adopted
> from outside sources and kept their original name (e.g. folder `composition-patterns` has
> `name: vercel-composition-patterns`). The folder name is what determines the path
> (`.claude/skills/<folder>/`); the frontmatter `name` is what Claude Code shows in the slash
> menu.

## What's in this repo

| Skill (folder)            | Frontmatter name                | Purpose                                                                                                             |
| ------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `git-commit-instructions` | `git-commit-instructions`       | Branch naming, commit format, `main`-stays-common-only rules for any Git operation.                                 |
| `git-guardian`            | `git-guardian`                  | Pre-commit/pre-push validation pass: branch name, branch boundaries, secrets, atomicity, commit message vs. diff.   |
| `pr`                      | `pr`                            | Draft/create/update a PR from the branch's actual base, commits, diff, and Jira task, using the repo's PR template. |
| `react-best-practices`    | `vercel-react-best-practices`   | Performance and rendering rules for React/Vite work: data fetching, bundling, re-renders.                           |
| `composition-patterns`    | `vercel-composition-patterns`   | Component API design: compound components, render props vs. children, avoiding boolean-prop proliferation.          |
| `react-components`        | `stitch::react-components`      | Converts/syncs Stitch designs into React components (AST-based validation).                                         |
| `shadcn-ui`               | `shadcn-ui`                     | shadcn/ui component discovery, installation, and customization conventions.                                         |
| `tanstack-query`          | `tanstack-query-best-practices` | Query key structure, cache policies, mutations, and server-state patterns.                                          |
| `playwright`              | `playwright`                    | Automating a real browser from the terminal via `playwright-cli` (navigation, screenshots, form filling).           |
| `frontend-design-review`  | `frontend-design-review`        | Design-quality review checklist for UI PRs and components (craft, accessibility, design-system compliance).         |

The first three are repo-specific workflow rules (authored for UniSage). The rest were adopted
from outside sources for general React/frontend best practices — treat their guidance as defaults,
not commands that override `AGENTS.md` when the two genuinely conflict.

## Adding a new skill

1. `mkdir .claude/skills/<name>` and add `SKILL.md` with `name` + `description` frontmatter. Write
   the `description` as a trigger condition ("Use when...") — that's what decides when it loads.
2. Keep the body focused; move long reference material into `resources/`, `references/`, or
   `rules/` subfolders and point to them from the body instead of inlining everything.
3. Add a one-line entry to the table above and, if it's a frontend skill agents should consult
   proactively, list it under "Frontend skills" in [AGENTS.md](../AGENTS.md).
4. Verify with `quick_validate.py` per the verification matrix in `AGENTS.md`/`git-guardian`, if
   available.
