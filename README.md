# Workout Generator
Deployed at https://randomgym.vercel.app

This Next.js and TypeScript app generates randomized workouts and hosts interactive puzzles.

## Development

```bash
npm run dev
npm run typecheck
npm run build
```

Puzzle state is shared across all visitors through Firestore. Configure the Firebase service account and database ID values in `.env.local` before using the puzzle state API.
