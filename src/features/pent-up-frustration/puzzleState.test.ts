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

function toggleMode(state: PuzzleState, mode: 'towers' | 'multiReset') {
    return puzzleReducer(state, {type: 'toggleMode', mode});
}

describe('puzzle state', () => {
    it('creates the initial move state', () => {
        const state = createPuzzleState();
        expect(state).toEqual({movePath: ['0,0'], mode: 'moves', towerBySection: new Map()});
        expect(towerCellsFor(state)).toEqual(new Set());
    });

    it('toggles modes on and off, with only one active mode', () => {
        const towers = toggleMode(createPuzzleState(), 'towers');
        expect(towers.mode).toBe('towers');
        expect(toggleMode(towers, 'towers').mode).toBe('moves');
        expect(toggleMode(towers, 'multiReset').mode).toBe('multiReset');
    });

    it('adds valid moves and rejects invalid moves', () => {
        const initial = createPuzzleState();
        const valid = select(initial, '2,1');
        expect(valid.movePath).toEqual(['0,0', '2,1']);
        expect(select(initial, '1,1')).toBe(initial);
    });

    it('allows only a one-step reset in normal mode', () => {
        const state = select(select(createPuzzleState(), '2,1'), '4,2');
        expect(select(state, '2,1').movePath).toEqual(['0,0', '2,1']);
        expect(select(state, '0,0')).toBe(state);
        expect(select(state, '4,2')).toBe(state);
    });

    it('allows resetting to any prior move in multi-reset mode', () => {
        let state = select(select(createPuzzleState(), '2,1'), '4,2');
        state = toggleMode(state, 'multiReset');
        expect(select(state, '0,0').movePath).toEqual(['0,0']);
    });

    it('does not exceed the square limit', () => {
        const state: PuzzleState = {
            ...createPuzzleState(),
            movePath: Array<CellKey>(MAX_MARKED_SQUARES).fill('0,0'),
        };
        expect(select(state, '7,7')).toBe(state);
    });

    it('adds, removes, and replaces the tower in a section', () => {
        let state = toggleMode(createPuzzleState(), 'towers');
        state = select(state, '0,0');
        expect(towerCellsFor(state)).toEqual(new Set(['0,0']));

        state = select(state, '1,0');
        expect(towerCellsFor(state)).toEqual(new Set(['1,0']));

        state = select(state, '1,0');
        expect(towerCellsFor(state)).toEqual(new Set());
    });

    it('ignores tower placement outside the puzzle', () => {
        const state = toggleMode(createPuzzleState(), 'towers');
        expect(select(state, '9,9')).toBe(state);
    });

    it('keeps a valid path and truncates a path broken by a tower change', () => {
        let valid = select(select(select(createPuzzleState(), '2,1'), '4,2'), '6,1');
        valid = toggleMode(valid, 'towers');
        const stillValid = select(valid, '7,7');
        expect(stillValid.movePath).toEqual(valid.movePath);

        const truncated = select(valid, '4,2');
        expect(truncated.movePath).toEqual(['0,0', '2,1', '4,2']);
    });

    it('rejects a new move with invalid tower division', () => {
        const state: PuzzleState = {
            movePath: ['0,0', '2,1', '4,2'],
            mode: 'moves',
            towerBySection: new Map([[9, '2,1'], [8, '4,2']]),
        };
        expect(select(state, '6,1')).toBe(state);
    });
});
