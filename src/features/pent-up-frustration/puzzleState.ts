import {PUZZLE_CELLS} from './puzzleDefinition';
import {availableScoresFor, availableTowersFor, connectedPath, evaluateProgress} from './puzzleProgress';
import type {CellKey} from './types';
import type {ScoreSequenceStart} from './scoreSequences';

export const MAX_MARKED_SQUARES = 64;
export const MAX_MOVE = 64;
export const STARTING_CELL: CellKey = '0,0';

export type PuzzleMode = 'moves' | 'erase';

export type PuzzleState = {
    moves: readonly (CellKey | null)[];
    displayScores: readonly (bigint | undefined)[];
    selectedMove: number;
    mode: PuzzleMode;
    towerBySection: ReadonlyMap<number, CellKey>;
};

export type PuzzleAction =
    | {type: 'selectCell'; key: CellKey}
    | {type: 'selectMove'; move: number}
    | {type: 'toggleErase'}
    | {type: 'load'; state: PuzzleState};

const sectionByCell = new Map(PUZZLE_CELLS.map(cell => [cell.key, cell.section]));
const startingSection = sectionByCell.get(STARTING_CELL) as number;

export function createPuzzleState(): PuzzleState {
    return {moves: [STARTING_CELL], displayScores: [BigInt(0)], selectedMove: 1, mode: 'moves', towerBySection: new Map()};
}

export function puzzleReducer(state: PuzzleState, action: PuzzleAction): PuzzleState {
    if (action.type === 'load') return action.state;

    if (action.type === 'toggleErase') {
        return {...state, mode: state.mode === 'erase' ? 'moves' : 'erase'};
    }

    if (action.type === 'selectMove') {
        const selectedMove = Math.max(1, Math.min(MAX_MOVE, action.move));
        return {...state, selectedMove};
    }

    return updateMovePath(state, action.key);
}

export function towerCellsFor(state: PuzzleState) {
    return new Set(state.towerBySection.values());
}

export function scoreSequenceStartFor(state: PuzzleState): ScoreSequenceStart | null {
    const selectedCell = state.moves[state.selectedMove];
    const selectedScore = state.displayScores[state.selectedMove];
    if (!selectedCell || selectedScore === undefined) return null;
    return {
        score: selectedScore,
        move: state.selectedMove + 1,
        height: towerCellsFor(state).has(selectedCell) ? 1 : 0,
    };
}

function updateMovePath(state: PuzzleState, key: CellKey): PuzzleState {
    const existingMove = state.moves.indexOf(key);

    if (existingMove >= 0) {
        if (key === STARTING_CELL && state.moves.filter(Boolean).length === 1) return toggleStartingTower(state);
        if (state.mode !== 'erase') {
            return {...state, selectedMove: Math.max(1, existingMove)};
        }
        if (existingMove === 0) return state;
        const moves = [...state.moves];
        moves[existingMove] = null;
        const displayScores = [...state.displayScores];
        displayScores[existingMove] = undefined;
        const towerBySection = new Map(state.towerBySection);
        for (const [section, tower] of towerBySection) {
            if (tower === key) towerBySection.delete(section);
        }
        return rebuildMoves(moves, {...state, displayScores, towerBySection});
    }

    if (state.moves.filter(Boolean).length >= MAX_MARKED_SQUARES) return state;

    return placeMove(state, key);
}

function placeMove(state: PuzzleState, key: CellKey): PuzzleState {
    if (!sectionByCell.has(key) || state.moves[state.selectedMove]) return state;
    const moves = Array.from(
        {length: Math.max(state.moves.length, state.selectedMove + 1)},
        (_, move) => state.moves[move] ?? null,
    );
    moves[state.selectedMove] = key;
    const rebuilt = rebuildMoves(moves, state);
    return {...rebuilt, selectedMove: nextEmptyMove(moves, state.selectedMove + 1)};
}

function rebuildMoves(moves: readonly (CellKey | null)[], state: PuzzleState): PuzzleState {
    const startingTower = state.towerBySection.get(startingSection) === STARTING_CELL;
    const progress = evaluateProgress(moves, startingTower);
    const displayScores = [...state.displayScores];
    progress.scores.forEach((score, move) => { displayScores[move] = score; });
    const availableScores = availableScoresFor(moves, displayScores);
    const connectedTowers = mergeDisplayedTowers(state.towerBySection, progress.path, progress.towerBySection);
    const towerBySection = availableTowersFor(moves, availableScores, connectedTowers);
    return {...state, moves: trimMoves(moves), displayScores: availableScores, towerBySection};
}

function mergeDisplayedTowers(
    displayed: ReadonlyMap<number, CellKey>,
    verifiedPath: readonly CellKey[],
    verified: ReadonlyMap<number, CellKey>,
) {
    const pathCells = new Set(verifiedPath);
    const merged = new Map([...displayed].filter(([, cell]) => !pathCells.has(cell)));
    for (const [section, cell] of verified) merged.set(section, cell);
    return merged;
}

export function contiguousMovePath(state: PuzzleState): readonly CellKey[] {
    return connectedPath(state.moves);
}

function nextEmptyMove(moves: readonly (CellKey | null)[], start: number) {
    const orderedMoves = [
        ...Array.from({length: MAX_MOVE - start + 1}, (_, index) => start + index),
        ...Array.from({length: start - 1}, (_, index) => index + 1),
    ];
    // A board has 64 cells but 65 addressable slots (0–64), so an empty slot always exists.
    return orderedMoves.find(move => !moves[move]) as number;
}

function trimMoves(moves: readonly (CellKey | null)[]) {
    const trimmed = [...moves];
    while (trimmed.length > 1 && trimmed.at(-1) === null) trimmed.pop();
    return trimmed;
}

function toggleStartingTower(state: PuzzleState): PuzzleState {
    const towerBySection = new Map(state.towerBySection);
    if (towerBySection.get(startingSection) === STARTING_CELL) towerBySection.delete(startingSection);
    else if (towerBySection.has(startingSection)) return state;
    else towerBySection.set(startingSection, STARTING_CELL);
    return {...state, towerBySection};
}
