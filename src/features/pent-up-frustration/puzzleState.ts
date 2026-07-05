import {PUZZLE_CELLS} from './puzzleDefinition';
import {evaluatePath} from './puzzleRules';
import type {CellKey} from './types';

export const MAX_MARKED_SQUARES = 64;
export const STARTING_CELL: CellKey = '0,0';

export type PuzzleMode = 'moves' | 'towers' | 'multiReset';

export type PuzzleState = {
    movePath: readonly CellKey[];
    mode: PuzzleMode;
    towerBySection: ReadonlyMap<number, CellKey>;
};

export type PuzzleAction =
    | {type: 'selectCell'; key: CellKey}
    | {type: 'toggleMode'; mode: Exclude<PuzzleMode, 'moves'>};

const sectionByCell = new Map(PUZZLE_CELLS.map(cell => [cell.key, cell.section]));

export function createPuzzleState(): PuzzleState {
    return {movePath: [STARTING_CELL], mode: 'moves', towerBySection: new Map()};
}

export function puzzleReducer(state: PuzzleState, action: PuzzleAction): PuzzleState {
    if (action.type === 'toggleMode') {
        return {...state, mode: state.mode === action.mode ? 'moves' : action.mode};
    }

    return state.mode === 'towers'
        ? toggleTower(state, action.key)
        : updateMovePath(state, action.key);
}

export function towerCellsFor(state: PuzzleState) {
    return new Set(state.towerBySection.values());
}

function updateMovePath(state: PuzzleState, key: CellKey): PuzzleState {
    const existingMove = state.movePath.indexOf(key);

    if (existingMove >= 0) {
        const isSingleStepReset = existingMove === state.movePath.length - 2;
        if (state.mode !== 'multiReset' && !isSingleStepReset) return state;
        return {...state, movePath: state.movePath.slice(0, existingMove + 1)};
    }

    if (state.movePath.length >= MAX_MARKED_SQUARES) return state;

    const nextPath = [...state.movePath, key];
    const evaluation = evaluatePath(nextPath, towerCellsFor(state));
    return evaluation.validLength === nextPath.length ? {...state, movePath: nextPath} : state;
}

function toggleTower(state: PuzzleState, key: CellKey): PuzzleState {
    const section = sectionByCell.get(key);
    if (section === undefined) return state;

    const towerBySection = new Map(state.towerBySection);
    if (towerBySection.get(section) === key) towerBySection.delete(section);
    else towerBySection.set(section, key);

    const towers = new Set(towerBySection.values());
    const evaluation = evaluatePath(state.movePath, towers);
    const movePath = evaluation.validLength === state.movePath.length
        ? state.movePath
        : state.movePath.slice(0, evaluation.validLength);

    return {...state, movePath, towerBySection};
}
