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
            version: 1,
            movePath: ['0,0', '2,1', '4,2'],
            startingCellIsTower: true,
        });
        expect(restorePuzzleState(JSON.parse(JSON.stringify(storedState)))).toEqual(state);
    });

    it('restores the legacy tower-cell schema for existing boards', () => {
        const legacyState = {movePath: ['0,0', '0,2'], towerCells: ['0,2']};
        const restored = restorePuzzleState(legacyState);

        expect(restored?.movePath).toEqual(['0,0', '0,2']);
        expect(restored && storePuzzleState(restored)).toEqual({
            version: 1,
            movePath: ['0,0', '0,2'],
            startingCellIsTower: false,
        });
    });

    it('rejects state that cannot produce a valid board', () => {
        expect(restorePuzzleState({movePath: ['0,0', '1,1'], towerCells: []})).toBeNull();
        expect(restorePuzzleState({movePath: ['0,0'], towerCells: ['7,7']})).toBeNull();
        expect(restorePuzzleState({movePath: ['outside'], towerCells: []})).toBeNull();
        expect(restorePuzzleState({version: 2, movePath: ['0,0'], startingCellIsTower: false})).toBeNull();
    });
});
