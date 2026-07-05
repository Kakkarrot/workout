import {describe, expect, it} from 'vitest';
import {
    MAX_MARKED_SQUARES,
    createPuzzleState,
    puzzleReducer,
    scoreSequenceStartFor,
    contiguousMovePath,
    towerCellsFor,
    type PuzzleState,
} from './puzzleState';
import type {CellKey} from './types';

function select(state: PuzzleState, key: CellKey) {
    return puzzleReducer(state, {type: 'selectCell', key});
}

function toggleErase(state: PuzzleState) {
    return puzzleReducer(state, {type: 'toggleErase'});
}

describe('puzzle state', () => {
    it('creates the initial move state', () => {
        const state = createPuzzleState();
        expect(state).toEqual({
            moves: ['0,0'],
            displayScores: [BigInt(0)],
            selectedMove: 0,
            mode: 'moves',
            towerBySection: new Map(),
        });
        expect(towerCellsFor(state)).toEqual(new Set());
    });

    it('loads a complete state', () => {
        const loaded = {...createPuzzleState(), mode: 'erase' as const};
        expect(puzzleReducer(createPuzzleState(), {type: 'load', state: loaded})).toBe(loaded);
    });

    it('returns only the connected move prefix', () => {
        const state = {...createPuzzleState(), moves: ['0,0', '2,1', null, '7,7'] as const};
        expect(contiguousMovePath(state)).toEqual(['0,0', '2,1']);
    });

    it('toggles a tower on the starting square before movement', () => {
        const withTower = select(createPuzzleState(), '0,0');
        expect(towerCellsFor(withTower)).toEqual(new Set(['0,0']));
        expect(towerCellsFor(select(withTower, '0,0'))).toEqual(new Set());

        const conflicting: PuzzleState = {
            ...createPuzzleState(),
            towerBySection: new Map([[10, '1,0']]),
        };
        expect(select(conflicting, '0,0')).toBe(conflicting);
    });

    it('toggles the starting tower after moves have been placed', () => {
        let state = select(createPuzzleState(), '2,1');
        state = select(state, '0,0');
        expect(towerCellsFor(state)).toContain('0,0');
        state = select(state, '0,0');
        expect(towerCellsFor(state)).not.toContain('0,0');
    });

    it('toggles erase mode on and off', () => {
        const erase = toggleErase(createPuzzleState());
        expect(erase.mode).toBe('erase');
        expect(toggleErase(erase).mode).toBe('moves');
    });

    it('stores both valid and partially verified moves', () => {
        const initial = createPuzzleState();
        const valid = select(initial, '2,1');
        expect(valid.moves).toEqual(['0,0', '2,1']);
        expect(select(initial, '1,1').moves).toEqual(['0,0', '1,1']);
    });

    it('selects the tapped move when a populated square is tapped', () => {
        const state = select(select(createPuzzleState(), '2,1'), '4,2');
        const selected = select(state, '2,1');
        expect(selected.moves).toEqual(state.moves);
        expect(selected.selectedMove).toBe(1);
    });

    it('starts score generation after the selected move using its score', () => {
        let state = select(select(createPuzzleState(), '2,1'), '4,2');
        state = select(state, '4,2');

        expect(scoreSequenceStartFor(state)).toEqual({score: BigInt(3), move: 3, height: 0});
        const startingTower = select(createPuzzleState(), '0,0');
        expect(scoreSequenceStartFor(startingTower)).toEqual({score: BigInt(0), move: 1, height: 1});
        const detached = {...createPuzzleState(), selectedMove: 6};
        expect(scoreSequenceStartFor(detached)).toBeNull();
        let selectedTower = select(createPuzzleState(), '0,2');
        selectedTower = select(selectedTower, '0,2');
        expect(scoreSequenceStartFor(selectedTower)).toEqual({score: BigInt(0), move: 2, height: 1});
    });

    it('erases only the selected populated move in erase mode', () => {
        let state = select(select(createPuzzleState(), '2,1'), '4,2');
        state = toggleErase(state);
        const erased = select(state, '2,1');
        expect(erased.moves).toEqual(['0,0', null, '4,2']);
        expect(erased.selectedMove).toBe(0);
        expect(select(state, '0,0')).toBe(state);
    });

    it('selects the nearest earlier populated move after erase', () => {
        let state = select(select(select(createPuzzleState(), '2,1'), '4,2'), '6,3');
        state = toggleErase(state);
        const erased = select(state, '6,3');
        expect(erased.selectedMove).toBe(2);
    });

    it('preserves future displayed scores when erasing one move', () => {
        let state = select(select(select(createPuzzleState(), '2,1'), '4,2'), '6,3');
        const futureScores = state.displayScores.slice(2);
        state = toggleErase(state);
        state = select(state, '2,1');

        expect(state.displayScores[1]).toBeUndefined();
        expect(state.displayScores.slice(2)).toEqual(futureScores);
        expect(state.moves).toEqual(['0,0', null, '4,2', '6,3']);
    });

    it('preserves future towers while removing a tower on the erased move', () => {
        let state = select(select(createPuzzleState(), '0,2'), '1,4');
        expect(towerCellsFor(state)).toEqual(new Set(['0,2', '1,4']));

        state = toggleErase(state);
        state = select(state, '0,2');

        expect(state.moves).toEqual(['0,0', null, '1,4']);
        expect(towerCellsFor(state)).toEqual(new Set(['1,4']));
    });

    it('places the following move from the active populated move', () => {
        const state = select(createPuzzleState(), '2,1');
        const placed = puzzleReducer(state, {type: 'selectCell', key: '4,2'});
        expect(placed.moves).toEqual(['0,0', '2,1', '4,2']);
        expect(placed.selectedMove).toBe(2);
    });

    it('ignores placement at an occupied move 64', () => {
        const moves = Array<CellKey | null>(65).fill(null);
        moves[0] = '0,0';
        moves[2] = '2,1';
        moves[64] = '7,6';
        const state = {...createPuzzleState(), moves, selectedMove: 64};
        expect(puzzleReducer(state, {type: 'selectCell', key: '7,7'})).toBe(state);
    });

    it('keeps placement when an existing connected prefix has invalid geometry', () => {
        const state: PuzzleState = {...createPuzzleState(), moves: ['0,0', '1,1', null], selectedMove: 2};
        expect(select(state, '7,7').moves).toEqual(['0,0', '1,1', null, '7,7']);
    });

    it('does not exceed the square limit', () => {
        const state: PuzzleState = {
            ...createPuzzleState(),
            moves: Array<CellKey>(MAX_MARKED_SQUARES).fill('0,0'),
        };
        expect(puzzleReducer(state, {type: 'selectCell', key: '7,7'})).toBe(state);
    });

    it('infers a tower when the 3D move changes elevation', () => {
        const state = select(createPuzzleState(), '0,2');
        expect(state.moves).toEqual(['0,0', '0,2']);
        expect(towerCellsFor(state)).toEqual(new Set(['0,2']));
    });

    it('rejects coordinates outside the puzzle', () => {
        const state = createPuzzleState();
        expect(select(state, '0,-2')).toBe(state);
    });

    it('clears towers inferred by reset moves', () => {
        let state = select(createPuzzleState(), '0,2');
        state = select(state, '1,4');
        expect(towerCellsFor(state)).toEqual(new Set(['0,2', '1,4']));
        state = toggleErase(state);
        state = select({...state, selectedMove: 2}, '1,4');
        expect(towerCellsFor(state)).toEqual(new Set(['0,2']));
    });

    it('preserves a starting tower when resetting the path', () => {
        let state = select(createPuzzleState(), '0,0');
        state = select(state, '2,1');
        state = select(state, '4,2');
        state = toggleErase(state);
        state = select(state, '4,2');
        expect(towerCellsFor(state)).toEqual(new Set(['0,0', '2,1']));
    });

    it('continues a loaded detached chain from its active move', () => {
        let state: PuzzleState = {
            ...createPuzzleState(),
            moves: ['0,0', null, null, null, null, null, '7,7'],
            selectedMove: 6,
        };
        state = select(state, '5,6');
        state = select(state, '3,7');
        expect(state.moves.slice(6)).toEqual(['7,7', '5,6', '3,7']);
    });

    it('stores a new move with invalid tower division or a mismatched clue', () => {
        const state: PuzzleState = {
            moves: ['0,0', '0,2', '1,4'],
            displayScores: [BigInt(0), BigInt(0), BigInt(2)],
            selectedMove: 2,
            mode: 'moves',
            towerBySection: new Map([[11, '0,2'], [12, '1,4']]),
        };
        expect(select(state, '1,6').moves[3]).toBe('1,6');

        const cluePath = select(select(createPuzzleState(), '2,1'), '4,2');
        expect(select(cluePath, '5,2').moves[3]).toBe('5,2');
    });
});
