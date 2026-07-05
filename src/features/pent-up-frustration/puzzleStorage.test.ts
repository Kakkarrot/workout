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
            version: 3,
            populatedCells: [
                {cell: '0,0', move: 0, value: '0', isTower: true},
                {cell: '2,1', move: 1, value: '1', isTower: true},
                {cell: '4,2', move: 2, value: '3', isTower: true},
            ],
        });
        expect(restorePuzzleState(JSON.parse(JSON.stringify(storedState)))).toEqual(state);
    });

    it('does not persist temporary highlights', () => {
        let state = puzzleReducer(createPuzzleState(), {type: 'toggleHighlight'});
        state = puzzleReducer(state, {type: 'selectCell', key: '2,1'});

        expect(storePuzzleState(state)).toEqual({
            version: 3,
            populatedCells: [{cell: '0,0', move: 0, value: '0', isTower: false}],
        });
    });

    it('round-trips towers retained on disconnected future moves', () => {
        let state = puzzleReducer(createPuzzleState(), {type: 'selectCell', key: '0,2'});
        state = puzzleReducer(state, {type: 'selectCell', key: '1,4'});
        state = puzzleReducer(state, {type: 'toggleErase'});
        state = puzzleReducer(state, {type: 'selectCell', key: '0,2'});

        const restored = restorePuzzleState(JSON.parse(JSON.stringify(storePuzzleState(state))));
        expect(restored?.moves).toEqual(['0,0', null, '1,4']);
        expect(restored?.displayScores).toEqual(state.displayScores);
        expect(restored && [...restored.towerBySection.values()]).toEqual(['1,4']);
    });

    it('rejects state that cannot produce a valid board', () => {
        expect(restorePuzzleState({version: 1, movePath: ['0,0'], startingCellIsTower: false})).toBeNull();
        expect(restorePuzzleState({version: 2, moves: ['0,0'], startingCellIsTower: false})).toBeNull();
        expect(restorePuzzleState({movePath: ['0,0'], towerCells: []})).toBeNull();
        expect(restorePuzzleState({version: 3, moves: ['0,0'], startingCellIsTower: false})).toBeNull();
        expect(restorePuzzleState({version: 3, populatedCells: [
            {cell: '0,0', move: 0, value: 'not-a-number', isTower: false},
        ]})).toBeNull();
        expect(restorePuzzleState({version: 3, populatedCells: [
            {cell: '0,0', move: 0, value: '1', isTower: false},
        ]})).toBeNull();
        expect(restorePuzzleState(null)).toBeNull();
        expect(restorePuzzleState('invalid')).toBeNull();
    });
});
