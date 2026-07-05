import {PUZZLE_ID} from './pent-up-frustration/puzzleDefinition';
import {restorePuzzleState, storePuzzleState} from './pent-up-frustration/puzzleStorage';

export type PuzzlePersistence = {
    normalize: (value: unknown) => object | null;
};

const persistenceByPuzzleId = new Map<string, PuzzlePersistence>([
    [PUZZLE_ID, {
        normalize(value) {
            const state = restorePuzzleState(value);
            return state ? storePuzzleState(state) : null;
        },
    }],
]);

export function puzzlePersistenceFor(puzzleId: string) {
    return persistenceByPuzzleId.get(puzzleId);
}
