import {describe, expect, it} from 'vitest';
import {createPuzzleState, puzzleReducer} from './puzzleState';
import {restorePuzzleState, storePuzzleState} from './puzzleStorage';

describe('puzzle storage', () => {
    it('round-trips a valid board through JSON', () => {
        let state = puzzleReducer(createPuzzleState(), {type: 'selectCell', key: '0,0'});
        state = puzzleReducer(state, {type: 'selectCell', key: '2,1'});
        state = puzzleReducer(state, {type: 'selectCell', key: '4,2'});

        const storedState = storePuzzleState(state);
        expect(storedState).toEqual({
            version: 2,
            moves: ['0,0', '2,1', '4,2'],
            startingCellIsTower: true,
        });
        expect(restorePuzzleState(JSON.parse(JSON.stringify(storedState)))).toEqual(state);
    });

    it('does not persist temporary highlights', () => {
        let state = puzzleReducer(createPuzzleState(), {type: 'toggleHighlight'});
        state = puzzleReducer(state, {type: 'selectCell', key: '2,1'});

        expect(storePuzzleState(state)).toEqual({
            version: 2,
            moves: ['0,0'],
            startingCellIsTower: false,
        });
    });

    it('restores the legacy tower-cell schema for existing boards', () => {
        const legacyState = {movePath: ['0,0', '0,2'], towerCells: ['0,2']};
        const restored = restorePuzzleState(legacyState);

        expect(restored?.moves).toEqual(['0,0', '0,2']);
        expect(restored && storePuzzleState(restored)).toEqual({
            version: 2,
            moves: ['0,0', '0,2'],
            startingCellIsTower: false,
        });
    });

    it('restores version 1 and sparse version 2 boards', () => {
        expect(restorePuzzleState({
            version: 1,
            movePath: ['0,0', '2,1'],
            startingCellIsTower: false,
        })?.moves).toEqual(['0,0', '2,1']);
        expect(restorePuzzleState({
            version: 2,
            moves: ['0,0', null, '4,2'],
            startingCellIsTower: false,
        })?.moves).toEqual(['0,0', null, '4,2']);
    });

    it('rejects state that cannot produce a valid board', () => {
        expect(restorePuzzleState({movePath: ['0,0', '1,1'], towerCells: []})?.moves).toEqual(['0,0', '1,1']);
        expect(restorePuzzleState({movePath: ['0,0'], towerCells: ['7,7']})).toBeNull();
        expect(restorePuzzleState({movePath: ['0,0', '0,2'], towerCells: ['1,4']})).toBeNull();
        expect(restorePuzzleState({movePath: ['outside'], towerCells: []})).toBeNull();
        expect(restorePuzzleState({version: 2, movePath: ['0,0'], startingCellIsTower: false})).toBeNull();
        expect(restorePuzzleState({version: 1, movePath: ['0,0', null], startingCellIsTower: false})).toBeNull();
        expect(restorePuzzleState({version: 2, moves: ['0,0'], startingCellIsTower: 'no'})).toBeNull();
        expect(restorePuzzleState({version: 3, moves: ['0,0'], startingCellIsTower: false})).toBeNull();
        expect(restorePuzzleState({movePath: ['0,0']})).toBeNull();
        expect(restorePuzzleState(null)).toBeNull();
        expect(restorePuzzleState('invalid')).toBeNull();
        expect(restorePuzzleState({
            version: 2,
            moves: ['0,0', '2,1', '2,1'],
            startingCellIsTower: false,
        })).toBeNull();
    });
});
