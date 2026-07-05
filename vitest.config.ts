import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
            include: [
                'src/features/pent-up-frustration/puzzleRules.ts',
                'src/features/pent-up-frustration/puzzleState.ts',
                'src/features/pent-up-frustration/puzzleProgress.ts',
                'src/features/pent-up-frustration/puzzleDefinition.ts',
                'src/features/pent-up-frustration/sectionColoring.ts',
                'src/features/pent-up-frustration/scoreSequences.ts',
                'src/features/pent-up-frustration/puzzleStorage.ts',
                'src/features/puzzlePersistence.ts',
                'src/features/pent-up-frustration/puzzleStateApi.ts',
            ],
            thresholds: {
                lines: 100,
                functions: 100,
                branches: 100,
                statements: 100,
            },
        },
    },
});
