---
name: git-commit-instructions
description: >-
  Apply the UniSage Git workflow when naming branches, choosing branch bases, preparing atomic
  commits, pushing changes, or opening pull requests. Enforce canonical owner/Jira branch names,
  English conventional commits, common-only main branches, secret safety, and non-destructive
  history. Use for any UniSage repository Git operation.
---

# UniSage Git Workflow

## Safety

1. Do not commit or push without explicit user instruction.
2. Never commit credentials, `.env` secrets, tokens, caches, build output, or local artifacts.
3. Never force-push or rewrite pushed history without explicit approval.
4. Commit directly to `main` only for explicitly requested common repository bootstrap or
   administrative changes.
5. Preserve unrelated user changes and stop if unexpected modifications appear.

## Branch Names

Use:

```text
<prefix>/<owner>-unisage-<task-number>-<short-name>
```

- Prefix: `feature`, `fix`, or `enhance`.
- Owner: `huy` or `huyen`.
- Task number: canonical Jira number without leading zeroes.
- Short name: concise lowercase ASCII kebab-case.

Validate with:

```regex
^(feature|fix|enhance)/(huy|huyen)-unisage-(0|[1-9][0-9]*)-[a-z0-9]+(?:-[a-z0-9]+)*$
```

Use canonical examples:

```text
feature/huyen-unisage-4-initialize-web
feature/huyen-unisage-15-auth-integration
fix/huy-unisage-317-citation-mapping
```

Reject forms such as:

```text
feature/UNISAGE-4-initialize-web
feature/huyen-unisage-04-initialize-web
feat/huyen-unisage-15-auth
feature/unisage-15-auth
```

Do not invent the owner or Jira task. Normalize `UNISAGE-04` to `unisage-4` in branch names.

## Branch Bases

- Keep `main` common-only: repository skills, GitHub metadata, hooks, and shared policy files.
- Do not place application source, framework configuration, dependencies, tests, or build output
  on `main`.
- Create the first application initialization branch from a clean, current `main`.
- Create later features from `main` unless they intentionally form a stacked PR.
- For a stacked PR, use the parent feature branch as the base and document the merge order.

## Commit Format

Use English, no emojis, and an uppercase Jira key:

```text
<type>(<scope>): [UNISAGE-N] <short outcome>

<Context/Root cause>:
- <why>

<Changes/Fix>:
- <what changed>

Verification:
- <commands and results>
```

Use `feat`, `fix`, `enhance`, `refactor`, `chore`, `docs`, `test`, `style`, or `revert` based on
the staged diff.

## Atomic Workflow

1. Inspect `git status --short --branch`.
2. Review the complete diff and separate unrelated concerns.
3. Stage only one coherent change.
4. Run checks appropriate to the staged scope.
5. Review `git diff --cached` and `git diff --cached --check`.
6. Build the message from the staged diff and actual verification.
7. Commit and push only within the user's authorization.

## Verification Matrix

- Skills and PR templates: run `quick_validate.py` for each skill plus `git diff --check`.
- React logic or components: run `pnpm test`, `pnpm run lint`, and `pnpm run build`.
- Routes, auth, permissions, or user interaction: also run `pnpm run test:e2e`.
- Documentation-only changes: run formatting or link checks when available.

Never claim checks that did not run.
