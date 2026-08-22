When a decision needs an Architecture Decision Record, and how to write one.

Write an ADR under `docs/adr/` (copy `docs/adr/0000-template.md`, number it sequentially) when a
change:

- Picks between two or more real alternatives for a cross-cutting concern (state management
  approach, caching strategy, folder/layering convention, a new dependency that replaces a
  hand-rolled pattern or vice versa).
- Is likely to be questioned or "fixed back" later by someone who doesn't know why it was done
  this way.
- Would be expensive to reverse once other code depends on it.

Don't write one for routine feature work, bug fixes, or just following an existing convention —
that's what `docs/architecture.md` and `architecture.md` in this rules directory are for. If a
later decision replaces an earlier ADR, mark the old one `Status: superseded by NNNN` rather than
deleting it.
