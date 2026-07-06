import {describe, expect, it} from 'vitest';
import {calculatePuzzleAnswer} from './puzzleAnswer';

describe('calculatePuzzleAnswer', () => {
    it('sums each visited score once for every orthogonally adjacent unvisited square', () => {
        expect(calculatePuzzleAnswer(['0,0', '2,1'], [BigInt(10), BigInt(5)])).toBe(BigInt(40));
    });

    it('returns null when a populated square has no score', () => {
        expect(calculatePuzzleAnswer(['0,0'], [])).toBeNull();
    });
});
