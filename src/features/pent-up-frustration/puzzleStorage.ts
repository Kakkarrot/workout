import {
    STARTING_CELL,
    createPuzzleState,
    puzzleReducer,
    towerCellsFor,
    type PuzzleState,
} from './puzzleState';
import {PUZZLE_CELLS} from './puzzleDefinition';
import type {CellKey} from './types';

export type StoredPuzzleState = {
    version: 1;
    movePath: readonly CellKey[];
    startingCellIsTower: boolean;
};

type LegacyStoredPuzzleState = {
    movePath: readonly CellKey[];
    towerCells: readonly CellKey[];
};

const validCells = new Set(PUZZLE_CELLS.map(cell => cell.key));

export function storePuzzleState(state: PuzzleState): StoredPuzzleState {
    return {
        version: 1,
        movePath: [...state.movePath],
        startingCellIsTower: towerCellsFor(state).has(STARTING_CELL),
    };
}

export function restorePuzzleState(value: unknown): PuzzleState | null {
    if (isStoredPuzzleState(value)) {
        return replayPuzzleState(value.movePath, value.startingCellIsTower);
    }

    if (!isLegacyStoredPuzzleState(value)) return null;
    const restored = replayPuzzleState(value.movePath, value.towerCells.includes(STARTING_CELL));
    if (!restored) return null;

    const restoredTowers = towerCellsFor(restored);
    const hasSameTowers = restoredTowers.size === value.towerCells.length
        && value.towerCells.every(key => restoredTowers.has(key));
    return hasSameTowers ? restored : null;
}

function replayPuzzleState(movePath: readonly CellKey[], startingCellIsTower: boolean) {
    let restored = createPuzzleState();
    if (startingCellIsTower) {
        restored = puzzleReducer(restored, {type: 'selectCell', key: STARTING_CELL});
    }
    for (const key of movePath.slice(1)) {
        restored = puzzleReducer(restored, {type: 'selectCell', key});
    }

    return restored.movePath.length === movePath.length ? restored : null;
}

function isStoredPuzzleState(value: unknown): value is StoredPuzzleState {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Partial<StoredPuzzleState>;
    return candidate.version === 1
        && Array.isArray(candidate.movePath)
        && candidate.movePath[0] === STARTING_CELL
        && candidate.movePath.every(isCellKey)
        && typeof candidate.startingCellIsTower === 'boolean';
}

function isLegacyStoredPuzzleState(value: unknown): value is LegacyStoredPuzzleState {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Partial<LegacyStoredPuzzleState>;
    return Array.isArray(candidate.movePath)
        && candidate.movePath[0] === STARTING_CELL
        && candidate.movePath.every(isCellKey)
        && Array.isArray(candidate.towerCells)
        && candidate.towerCells.every(isCellKey);
}

function isCellKey(key: unknown): key is CellKey {
    return typeof key === 'string' && validCells.has(key as CellKey);
}
