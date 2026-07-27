# Feature boundaries

Each product capability owns its API modules, query keys, schemas, hooks, and
feature-specific components. Route pages stay thin and compose feature screens.

The initial foundation implements `auth`, `chat`, `knowledge`, `ingestion`, and
`analytics`. The remaining directories are intentional boundaries for upcoming
workflows; they should not become a shared dumping ground.
