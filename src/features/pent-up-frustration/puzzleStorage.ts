import {STARTING_CELL, towerCellsFor, type PuzzleState} from './puzzleState';
import {hydratePuzzleBoardState} from './puzzleBoardState';
import {isPuzzleCell} from './puzzleTopology';
import type {CellKey} from './types';

export type StoredPuzzleState = {
    version: 3;
    populatedCells: readonly {
        cell: CellKey;
        move: number;
        value: string | null;
        isTower: boolean;
    }[];
};

type DecodedPuzzleState = {
    moves: readonly (CellKey | null)[];
    startingCellIsTower: boolean;
    towerCells: readonly CellKey[];
    displayScores: readonly (bigint | undefined)[];
};

export function storePuzzleState(state: PuzzleState): StoredPuzzleState {
    const towerCells = towerCellsFor(state);
    return {
        version: 3,
        populatedCells: state.moves.flatMap((cell, move) => cell ? [{
            cell,
            move,
            value: state.displayScores[move]?.toString() ?? null,
            isTower: towerCells.has(cell),
        }] : []),
    };
}

export function restorePuzzleState(value: unknown): PuzzleState | null {
    const decoded = decodePuzzleState(value);
    if (!decoded) return null;
    const restored = replayPuzzleState(
        decoded.moves,
        decoded.startingCellIsTower,
        decoded.towerCells,
        decoded.displayScores,
    );
    if (!restored) return null;
    if (decoded.displayScores.some((score, move) => score !== undefined && restored.displayScores[move] !== score)) {
        return null;
    }
    const restoredTowers = towerCellsFor(restored);
    const hasSameTowers = restoredTowers.size === decoded.towerCells.length
        && decoded.towerCells.every(key => restoredTowers.has(key));
    return hasSameTowers ? restored : null;
}

function replayPuzzleState(
    moves: readonly (CellKey | null)[],
    startingCellIsTower: boolean,
    towerCells: readonly CellKey[],
    displayScores: readonly (bigint | undefined)[],
) {
    const board = hydratePuzzleBoardState(moves, startingCellIsTower, towerCells, displayScores);
    if (!board) return null;
    const selectedMove = Math.max(0, board.moves.findLastIndex(Boolean));
    return {...board, selectedMove, mode: 'moves' as const, highlightedCells: new Set<CellKey>()};
}

function decodePuzzleState(value: unknown): DecodedPuzzleState | null {
    if (!value || typeof value !== 'object') return null;
    const candidate = value as Record<string, unknown>;

    return candidate.version === 3 ? decodePopulatedCells(candidate.populatedCells) : null;
}

function decodePopulatedCells(value: unknown): DecodedPuzzleState | null {
    if (!Array.isArray(value) || value.length === 0) return null;
    const cells = value as Record<string, unknown>[];
    if (!cells.every(cell => isPuzzleCell(cell.cell)
        && Number.isInteger(cell.move) && (cell.move as number) >= 0
        && (cell.value === null || typeof cell.value === 'string')
        && typeof cell.isTower === 'boolean')) return null;

    const maxMove = Math.max(...cells.map(cell => cell.move as number));
    const moves = Array<CellKey | null>(maxMove + 1).fill(null);
    const displayScores = Array<bigint | undefined>(maxMove + 1);
    const towerCells: CellKey[] = [];
    try {
        for (const candidate of cells) {
            const move = candidate.move as number;
            const cell = candidate.cell as CellKey;
            if (moves[move] !== null) return null;
            moves[move] = cell;
            if (candidate.value !== null) displayScores[move] = BigInt(candidate.value as string);
            if (candidate.isTower) towerCells.push(cell);
        }
    } catch {
        return null;
    }
    if (!isMoveSequence(moves)) return null;
    return {
        moves,
        startingCellIsTower: towerCells.includes(STARTING_CELL),
        towerCells,
        displayScores,
    };
}

function isMoveSequence(value: unknown): value is (CellKey | null)[] {
    return Array.isArray(value)
        && value[0] === STARTING_CELL
        && value.every(key => isPuzzleCell(key) || key === null);
}
