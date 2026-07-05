import {
    STARTING_CELL,
    createPuzzleBoardState,
    eraseMove,
    placeFollowingMove,
    scoreSequenceStartFor as scoreSequenceStartForBoard,
    toggleStartingTower,
    towerCellsFor,
    type PuzzleBoardState,
} from './puzzleBoardState';
import {connectedPath} from './puzzleProgress';
import type {ScoreSequenceStart} from './scoreSequences';
import type {CellKey} from './types';

export {MAX_MARKED_SQUARES, MAX_MOVE, STARTING_CELL, towerCellsFor} from './puzzleBoardState';

export type PuzzleMode = 'moves' | 'erase' | 'highlight';

export type PuzzleState = PuzzleBoardState & {
    selectedMove: number;
    mode: PuzzleMode;
    highlightedCells: ReadonlySet<CellKey>;
};

export type PuzzleAction =
    | {type: 'selectCell'; key: CellKey}
    | {type: 'toggleErase'}
    | {type: 'toggleHighlight'}
    | {type: 'load'; state: PuzzleState};

export function createPuzzleState(): PuzzleState {
    return {...createPuzzleBoardState(), selectedMove: 0, mode: 'moves', highlightedCells: new Set()};
}

export function puzzleReducer(state: PuzzleState, action: PuzzleAction): PuzzleState {
    if (action.type === 'load') return action.state;
    if (action.type === 'toggleErase') {
        return {...state, mode: state.mode === 'erase' ? 'moves' : 'erase'};
    }
    if (action.type === 'toggleHighlight') {
        return {...state, mode: state.mode === 'highlight' ? 'moves' : 'highlight'};
    }
    if (state.mode === 'highlight') return toggleHighlight(state, action.key);
    return selectCell(state, action.key);
}

export function scoreSequenceStartFor(state: PuzzleState): ScoreSequenceStart | null {
    return scoreSequenceStartForBoard(state, state.selectedMove);
}

export function contiguousMovePath(state: PuzzleState): readonly CellKey[] {
    return connectedPath(state.moves);
}

function selectCell(state: PuzzleState, key: CellKey): PuzzleState {
    const existingMove = state.moves.indexOf(key);
    if (existingMove >= 0) return selectExistingCell(state, key, existingMove);
    if (state.mode === 'erase') return state;

    const board = placeFollowingMove(state, state.selectedMove, key);
    return board ? {...state, ...board, selectedMove: state.selectedMove + 1} : state;
}

function selectExistingCell(state: PuzzleState, key: CellKey, move: number): PuzzleState {
    if (key === STARTING_CELL && state.mode !== 'erase') {
        const board = toggleStartingTower(state);
        return board ? {...state, ...board} : state;
    }
    if (state.mode !== 'erase') return {...state, selectedMove: move};
    const board = eraseMove(state, move);
    return board ? {...state, ...board, selectedMove: previousPopulatedMove(state.moves, move)} : state;
}

function previousPopulatedMove(moves: readonly (CellKey | null)[], before: number) {
    return Math.max(0, moves.slice(0, before).findLastIndex(Boolean));
}

function toggleHighlight(state: PuzzleState, key: CellKey): PuzzleState {
    const highlightedCells = new Set(state.highlightedCells);
    if (highlightedCells.has(key)) highlightedCells.delete(key);
    else highlightedCells.add(key);
    return {...state, highlightedCells};
}
