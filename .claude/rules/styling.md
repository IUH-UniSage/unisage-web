---
paths:
  - "src/**/*.tsx"
  - "src/**/*.ts"
  - "src/styles/**/*.css"
---

# Color tokens — no scattered arbitrary hex values

Never hardcode a color as a Tailwind arbitrary value (`bg-[#153898]`, `text-[#f9b200]`,
`dark:bg-[#171717]`, etc.) directly in a component's `className`. Every color must be centralized
as a CSS custom property in `src/styles/index.css`, exposed as a Tailwind utility via the
`@theme inline` block (`--color-<name>: var(--<name>)`), and referenced through the resulting
utility class (`bg-<name>`, `text-<name>`, ...).

Why: scattered hex values duplicate the same color under different literals, drift out of sync
across light/dark mode, and can't be reskinned from one place. This has already caused a real bug
in this repo — the same brand blue was hardcoded seven different ways across layouts/pages.

When a component needs a color:

1. Check if an existing token already covers it (`--primary`, `--sidebar`, `--knowledge`,
   `--secondary`, `--muted`, `--accent`, `--success`, `--hero`, `--hero-alt`, `--home-hero`,
   `--home-card`, `--brand-mark`, `--brand-glyph`, ...) — reuse it before adding a new one.
2. If genuinely new, add the raw value to both `:root` and `.dark` in `src/styles/index.css`, then
   add the corresponding `--color-<name>: var(--<name>)` line in the `@theme inline` block so
   Tailwind generates `bg-<name>` / `text-<name>` / `border-<name>` utilities.
3. Reference only the generated utility class in the component. Never inline the hex or an
   arbitrary-value bracket syntax for a color again.

A `dark:` override on a color utility is only needed when the token itself doesn't already flip
between `:root` and `.dark` — most of the existing tokens already do, so writing `dark:bg-X` next
to a token-based `bg-Y` is usually a sign the token is missing a dark value, not that the override
belongs on the class list.
