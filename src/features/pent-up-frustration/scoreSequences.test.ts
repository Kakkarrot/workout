import {describe, expect, it} from 'vitest';
import {generateScoresForward} from './scoreSequences';

describe('generateScoresForward', () => {
    it('generates and sorts paths from ground level', () => {
        expect(generateScoresForward(BigInt(3), 3, 0, 2)).toEqual([
            [BigInt(6), BigInt(10)],
            [BigInt(9), BigInt(13)],
            [BigInt(6), BigInt(24)],
        ]);
    });

    it('only descends when the score is divisible by the move', () => {
        expect(generateScoresForward(BigInt(6), 3, 1, 1)).toEqual([
            [BigInt(2)],
            [BigInt(9)],
        ]);
        expect(generateScoresForward(BigInt(5), 3, 1, 1)).toEqual([[BigInt(8)]]);
    });

    it('returns one empty continuation for zero steps', () => {
        expect(generateScoresForward(BigInt(5), 3, 0, 0)).toEqual([[]]);
    });

    it('keeps sequences with the same final score', () => {
        expect(generateScoresForward(BigInt(0), 1, 0, 2)).toEqual([
            [BigInt(0), BigInt(0)],
            [BigInt(1), BigInt(2)],
            [BigInt(0), BigInt(2)],
            [BigInt(1), BigInt(3)],
        ]);
    });

    it('rejects invalid step counts', () => {
        expect(() => generateScoresForward(BigInt(0), 1, 0, -1)).toThrow(RangeError);
        expect(() => generateScoresForward(BigInt(0), 1, 0, 1.5)).toThrow(RangeError);
        expect(() => generateScoresForward(BigInt(0), 1, 0, 11)).toThrow(RangeError);
    });
});
