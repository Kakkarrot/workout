import {STARTING_CELL, towerCellsFor, type PuzzleState} from './puzzleState';
import {hydratePuzzleBoardState} from './puzzleBoardState';
import {PUZZLE_CELLS} from './puzzleDefinition';
import type {CellKey} from './types';

export type StoredPuzzleState = {
    version: 2;
    moves: readonly (CellKey | null)[];
    startingCellIsTower: boolean;
};

type DecodedPuzzleState = {
    moves: readonly (CellKey | null)[];
    startingCellIsTower: boolean;
    legacyTowerCells?: readonly CellKey[];
};

const validCells = new Set(PUZZLE_CELLS.map(cell => cell.key));

export function storePuzzleState(state: PuzzleState): StoredPuzzleState {
    return {
        version: 2,
        moves: [...state.moves],
        startingCellIsTower: towerCellsFor(state).has(STARTING_CELL),
    };
}

export function restorePuzzleState(value: unknown): PuzzleState | null {
    const decoded = decodePuzzleState(value);
    if (!decoded) return null;
    const restored = replayPuzzleState(decoded.moves, decoded.startingCellIsTower);
    if (!restored) return null;
    if (!decoded.legacyTowerCells) return restored;
    const restoredTowers = towerCellsFor(restored);
    const hasSameTowers = restoredTowers.size === decoded.legacyTowerCells.length
        && decoded.legacyTowerCells.every(key => restoredTowers.has(key));
    return hasSameTowers ? restored : null;
}

function replayPuzzleState(moves: readonly (CellKey | null)[], startingCellIsTower: boolean) {
    const board = hydratePuzzleBoardState(moves, startingCellIsTower);
    if (!board) return null;
    const selectedMove = Math.max(0, board.moves.findLastIndex(Boolean));
    return {...board, selectedMove, mode: 'moves' as const};
}

function decodePuzzleState(value: unknown): DecodedPuzzleState | null {
    if (!value || typeof value !== 'object') return null;
    const candidate = value as Record<string, unknown>;

    if (candidate.version === 2) {
        return isMoveSequence(candidate.moves, true) && typeof candidate.startingCellIsTower === 'boolean'
            ? {moves: candidate.moves, startingCellIsTower: candidate.startingCellIsTower}
            : null;
    }
    if (candidate.version === 1) {
        return isMoveSequence(candidate.movePath, false) && typeof candidate.startingCellIsTower === 'boolean'
            ? {moves: candidate.movePath, startingCellIsTower: candidate.startingCellIsTower}
            : null;
    }
    if (candidate.version !== undefined) return null;

    if (!isMoveSequence(candidate.movePath, false) || !isCellSequence(candidate.towerCells)) return null;
    return {
        moves: candidate.movePath,
        startingCellIsTower: candidate.towerCells.includes(STARTING_CELL),
        legacyTowerCells: candidate.towerCells,
    };
}

function isMoveSequence(value: unknown, sparse: boolean): value is (CellKey | null)[] {
    return Array.isArray(value)
        && value[0] === STARTING_CELL
        && value.every(key => isCellKey(key) || (sparse && key === null));
}

function isCellSequence(value: unknown): value is CellKey[] {
    return Array.isArray(value) && value.every(isCellKey);
}

function isCellKey(key: unknown): key is CellKey {
    return typeof key === 'string' && validCells.has(key as CellKey);
}
