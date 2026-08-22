Core coding conventions for data fetching, styling, TypeScript, and components.

- **Data fetching**: TanStack Query only, keyed via each feature's `queries/keys.ts`, cached per
  `QUERY_POLICIES` in `src/constants/query-policies.ts` — don't invent ad-hoc `staleTime`s.
- **Style**: Tailwind utility classes + `cn()` (`src/lib/utils.ts`) only. No inline `style=`, no
  CSS-in-JS. Theme via `next-themes` + Tailwind tokens (`src/styles/index.css`) — see
  `styling.md` for the color-token rule specifically.
- **TypeScript**: no `any`, no `@ts-ignore`. Forms via `react-hook-form` + `zod` schemas under
  `src/features/<feature>/schemas/`.
- **Components**: function components, no `React.FC`. Keep route `pages/*` thin — real logic
  belongs in `src/features/<feature>`.
- **UI kit**: only add primitives via shadcn conventions (see
  `.claude/skills/shadcn-ui/`) — don't hand-roll a component that already exists there.
