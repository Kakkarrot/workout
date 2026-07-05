import {describe, expect, it} from 'vitest';
import {
    MAX_MARKED_SQUARES,
    createPuzzleState,
    puzzleReducer,
    towerCellsFor,
    type PuzzleState,
} from './puzzleState';
import type {CellKey} from './types';

function select(state: PuzzleState, key: CellKey) {
    return puzzleReducer(state, {type: 'selectCell', key});
}

function toggleMultiReset(state: PuzzleState) {
    return puzzleReducer(state, {type: 'toggleMultiReset'});
}

describe('puzzle state', () => {
    it('creates the initial move state', () => {
        const state = createPuzzleState();
        expect(state).toEqual({movePath: ['0,0'], mode: 'moves', towerBySection: new Map()});
        expect(towerCellsFor(state)).toEqual(new Set());
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

    it('toggles multi-reset mode on and off', () => {
        const multiReset = toggleMultiReset(createPuzzleState());
        expect(multiReset.mode).toBe('multiReset');
        expect(toggleMultiReset(multiReset).mode).toBe('moves');
    });

    it('adds valid moves and rejects invalid moves', () => {
        const initial = createPuzzleState();
        const valid = select(initial, '2,1');
        expect(valid.movePath).toEqual(['0,0', '2,1']);
        expect(select(initial, '1,1')).toBe(initial);
    });

    it('allows only a one-step reset in normal mode', () => {
        const state = select(select(createPuzzleState(), '2,1'), '4,2');
        expect(select(state, '4,2').movePath).toEqual(['0,0', '2,1']);
        expect(select(state, '2,1')).toBe(state);
        expect(select(state, '0,0')).toBe(state);
    });

    it('allows resetting to any prior move in multi-reset mode', () => {
        let state = select(select(createPuzzleState(), '2,1'), '4,2');
        state = toggleMultiReset(state);
        expect(select(state, '0,0').movePath).toEqual(['0,0']);
        expect(select(state, '2,1').movePath).toEqual(['0,0']);
    });

    it('does not exceed the square limit', () => {
        const state: PuzzleState = {
            ...createPuzzleState(),
            movePath: Array<CellKey>(MAX_MARKED_SQUARES).fill('0,0'),
        };
        expect(select(state, '7,7')).toBe(state);
    });

    it('infers a tower when the 3D move changes elevation', () => {
        const state = select(createPuzzleState(), '0,2');
        expect(state.movePath).toEqual(['0,0', '0,2']);
        expect(towerCellsFor(state)).toEqual(new Set(['0,2']));
    });

    it('rejects an inferred tower when its region already has another tower', () => {
        const state: PuzzleState = {
            ...createPuzzleState(),
            towerBySection: new Map([[11, '0,1']]),
        };
        expect(select(state, '0,2')).toBe(state);
    });

    it('rejects a non-tower destination already marked as a tower', () => {
        const state: PuzzleState = {
            movePath: ['0,0'],
            mode: 'moves',
            towerBySection: new Map([[10, '0,0'], [11, '0,2']]),
        };
        expect(select(state, '0,2')).toBe(state);
    });

    it('rejects coordinates outside the puzzle', () => {
        const state = createPuzzleState();
        expect(select(state, '0,-2')).toBe(state);
    });

    it('clears towers inferred by reset moves', () => {
        let state = select(createPuzzleState(), '0,2');
        state = select(state, '1,4');
        expect(towerCellsFor(state)).toEqual(new Set(['0,2', '1,4']));
        state = toggleMultiReset(state);
        state = select(state, '1,4');
        expect(towerCellsFor(state)).toEqual(new Set(['0,2']));
    });

    it('preserves a starting tower when resetting the path', () => {
        let state = select(createPuzzleState(), '0,0');
        state = select(state, '2,1');
        state = select(state, '4,2');
        state = select(state, '4,2');
        expect(towerCellsFor(state)).toEqual(new Set(['0,0', '2,1']));
    });

    it('rejects a new move with invalid tower division or a mismatched clue', () => {
        const state: PuzzleState = {
            movePath: ['0,0', '0,2', '1,4'],
            mode: 'moves',
            towerBySection: new Map([[11, '0,2'], [12, '1,4']]),
        };
        expect(select(state, '1,6')).toBe(state);

        const cluePath = select(select(createPuzzleState(), '2,1'), '4,2');
        expect(select(cluePath, '5,2')).toBe(cluePath);
    });
});
