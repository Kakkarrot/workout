import {describe, expect, it} from 'vitest';
import {PUZZLE_ID} from './pent-up-frustration/puzzleDefinition';
import {puzzlePersistenceFor} from './puzzlePersistence';

describe('puzzle persistence registry', () => {
    it('returns the registered puzzle persistence adapter', () => {
        const persistence = puzzlePersistenceFor(PUZZLE_ID);
        expect(persistence).toBeDefined();
        expect(persistence?.normalize({
            version: 1,
            movePath: ['0,0', '2,1'],
            startingCellIsTower: false,
        })).toEqual({
            version: 2,
            moves: ['0,0', '2,1'],
            startingCellIsTower: false,
        });
    });

    it('rejects invalid state and unknown puzzle ids', () => {
        expect(puzzlePersistenceFor(PUZZLE_ID)?.normalize({invalid: true})).toBeNull();
        expect(puzzlePersistenceFor('unknown')).toBeUndefined();
    });
});
