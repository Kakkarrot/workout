# Repository Guidelines

Small full-stack Next.js and TypeScript app using the App Router and Material UI.

## Commands

- `npm run dev` — run the development server
- `npm run build` — create a production build
- `npm run typecheck` — check TypeScript
- `npm test` — run the Vitest suite

## Structure

- `src/app/` — routes and global styles
- `src/features/` — feature-owned models, state, and UI
- `src/components/` — shared UI
- `src/lib/` — server-only integrations

## Conventions

- Keep changes simple and consistent with the existing TypeScript code.
- Keep immutable puzzle definitions separate from interactive state.
- Keep Firestore credentials and Admin SDK access in server-only modules.
- The puzzle state is intentionally shared by every visitor; there is no authentication.
- Load shared puzzle state once on page load and save only through the explicit Save action; do not add polling or realtime synchronization without changing the product requirements.
- Persist a versioned, minimal puzzle state and reconstruct derived values through the puzzle rules. Keep legacy decoders isolated to storage modules.
- Register persisted puzzles through `src/features/puzzlePersistence.ts`; generic API routes must not import a concrete puzzle directly.
- Keep rendering, interactive state, persistence serialization, and async load/save lifecycle in separate feature-owned modules.
- Do not commit generated files or IDE-specific configuration.

## Roadmap

- Add focused tests for the persistence API registry and client load/save lifecycle.
