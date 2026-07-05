import {PUZZLE_CELLS} from './puzzleDefinition';
import {destinationElevation, evaluatePath} from './puzzleRules';
import type {CellKey} from './types';

export const MAX_MARKED_SQUARES = 64;
export const STARTING_CELL: CellKey = '0,0';

export type PuzzleMode = 'moves' | 'multiReset';

export type PuzzleState = {
    movePath: readonly CellKey[];
    mode: PuzzleMode;
    towerBySection: ReadonlyMap<number, CellKey>;
};

export type PuzzleAction =
    | {type: 'selectCell'; key: CellKey}
    | {type: 'toggleMultiReset'}
    | {type: 'load'; state: PuzzleState};

const sectionByCell = new Map(PUZZLE_CELLS.map(cell => [cell.key, cell.section]));
const startingSection = sectionByCell.get(STARTING_CELL) as number;

export function createPuzzleState(): PuzzleState {
    return {movePath: [STARTING_CELL], mode: 'moves', towerBySection: new Map()};
}

export function puzzleReducer(state: PuzzleState, action: PuzzleAction): PuzzleState {
    if (action.type === 'load') return action.state;

    if (action.type === 'toggleMultiReset') {
        return {...state, mode: state.mode === 'multiReset' ? 'moves' : 'multiReset'};
    }

    return updateMovePath(state, action.key);
}

export function towerCellsFor(state: PuzzleState) {
    return new Set(state.towerBySection.values());
}

function updateMovePath(state: PuzzleState, key: CellKey): PuzzleState {
    const existingMove = state.movePath.indexOf(key);

    if (existingMove >= 0) {
        if (key === STARTING_CELL && state.movePath.length === 1) return toggleStartingTower(state);
        const isLatestMove = existingMove === state.movePath.length - 1 && existingMove > 0;
        if (state.mode !== 'multiReset' && !isLatestMove) return state;
        return rebuildPath(
            state.movePath.slice(0, Math.max(1, existingMove)),
            state.mode,
            state.towerBySection.get(startingSection) === STARTING_CELL,
        );
    }

    if (state.movePath.length >= MAX_MARKED_SQUARES) return state;

    return appendMove(state, key);
}

function appendMove(state: PuzzleState, key: CellKey): PuzzleState {
    const from = state.movePath[state.movePath.length - 1];
    const towers = towerCellsFor(state);
    const toIsTower = destinationElevation(from, key, towers.has(from));
    if (toIsTower === null) return state;

    const section = sectionByCell.get(key);
    if (section === undefined) return state;

    const towerBySection = new Map(state.towerBySection);
    const regionTower = towerBySection.get(section);

    if (toIsTower) {
        if (regionTower !== undefined && regionTower !== key) return state;
        towerBySection.set(section, key);
    } else if (regionTower === key) {
        return state;
    }

    const movePath = [...state.movePath, key];
    const evaluation = evaluatePath(movePath, new Set(towerBySection.values()));
    return evaluation.validLength === movePath.length ? {...state, movePath, towerBySection} : state;
}

function rebuildPath(path: readonly CellKey[], mode: PuzzleMode, startingTower: boolean) {
    let rebuilt: PuzzleState = {...createPuzzleState(), mode};
    if (startingTower) rebuilt = toggleStartingTower(rebuilt);
    for (const key of path.slice(1)) rebuilt = appendMove(rebuilt, key);
    return rebuilt;
}

function toggleStartingTower(state: PuzzleState): PuzzleState {
    const towerBySection = new Map(state.towerBySection);
    if (towerBySection.get(startingSection) === STARTING_CELL) towerBySection.delete(startingSection);
    else if (towerBySection.has(startingSection)) return state;
    else towerBySection.set(startingSection, STARTING_CELL);
    return {...state, towerBySection};
}
