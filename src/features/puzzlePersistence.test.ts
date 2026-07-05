import {describe, expect, it} from 'vitest';
import {PUZZLE_ID} from './pent-up-frustration/puzzleDefinition';
import {puzzlePersistenceFor} from './puzzlePersistence';

describe('puzzle persistence registry', () => {
    it('returns the registered puzzle persistence adapter', () => {
        const persistence = puzzlePersistenceFor(PUZZLE_ID);
        expect(persistence).toBeDefined();
        expect(persistence?.normalize({
            version: 3,
            populatedCells: [
                {cell: '0,0', move: 0, value: '0', isTower: false},
                {cell: '2,1', move: 1, value: '1', isTower: false},
            ],
        })).toEqual({
            version: 3,
            populatedCells: [
                {cell: '0,0', move: 0, value: '0', isTower: false},
                {cell: '2,1', move: 1, value: '1', isTower: false},
            ],
        });
    });

    it('rejects invalid state and unknown puzzle ids', () => {
        expect(puzzlePersistenceFor(PUZZLE_ID)?.normalize({invalid: true})).toBeNull();
        expect(puzzlePersistenceFor('unknown')).toBeUndefined();
    });
});
