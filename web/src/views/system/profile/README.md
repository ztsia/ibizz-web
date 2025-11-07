# Profile Feature Scaffolding

This folder contains scaffolding for the Tax Agent Profile feature (no implementation code).

Created items:

- `components/` - place for small UI components (Toggle button, etc.)
- `tests/unit/` - unit tests for components and services
- `tests/e2e/` - e2e tests for route and user scenarios

Notes:

- Follow TDD: write failing tests under `tests/*` before implementing components.
- UI must use shadcn-ui components and Tailwind utilities only.
- Services should use `web/src/views/system/services/mock_db.ts` for DB interactions.
