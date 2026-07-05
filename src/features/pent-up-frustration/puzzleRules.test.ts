import {describe, expect, it} from 'vitest';
import {evaluatePath} from './puzzleRules';
import type {CellKey} from './types';

const noTowers = new Set<CellKey>();
const noClues = {};

describe('evaluatePath', () => {
    it('handles an empty path and starts a non-empty path at score zero', () => {
        expect(evaluatePath([], noTowers, noClues)).toEqual({scores: [], validLength: 0});
        expect(evaluatePath(['0,0'], noTowers, noClues)).toEqual({scores: [BigInt(0)], validLength: 1});
    });

    it('adds the move number while staying at the same elevation', () => {
        const result = evaluatePath(['0,0', '1,2', '3,3'], noTowers, noClues);
        expect(result).toEqual({scores: [BigInt(0), BigInt(1), BigInt(3)], validLength: 3});
    });

    it('multiplies when moving up', () => {
        const towers = new Set<CellKey>(['1,4']);
        expect(evaluatePath(['0,0', '1,2', '1,4'], towers, noClues)).toEqual({
            scores: [BigInt(0), BigInt(1), BigInt(2)],
            validLength: 3,
        });
    });

    it('divides evenly when moving down', () => {
        const towers = new Set<CellKey>(['0,0', '1,2', '3,3']);
        expect(evaluatePath(['0,0', '1,2', '3,3', '3,5'], towers, noClues)).toEqual({
            scores: [BigInt(0), BigInt(1), BigInt(3), BigInt(1)],
            validLength: 4,
        });
    });

    it('rejects a downward move when the score is not evenly divisible', () => {
        const towers = new Set<CellKey>(['0,2', '1,4']);
        expect(evaluatePath(['0,0', '0,2', '1,4', '1,6'], towers, noClues)).toEqual({
            scores: [BigInt(0), BigInt(0), BigInt(2)],
            validLength: 3,
        });
    });

    it('accepts both planar knight orientations and rejects other movement', () => {
        expect(evaluatePath(['0,0', '2,1'], noTowers, noClues).validLength).toBe(2);
        expect(evaluatePath(['0,0', '1,1'], noTowers, noClues)).toEqual({
            scores: [BigInt(0)],
            validLength: 1,
        });
    });

    it('requires opposite elevations for a vertical knight move', () => {
        expect(evaluatePath(['0,0', '0,2'], noTowers, noClues).validLength).toBe(1);
        expect(evaluatePath(['0,0', '0,2'], new Set<CellKey>(['0,2']), noClues).validLength).toBe(2);
        expect(evaluatePath(['0,0', '2,0'], new Set<CellKey>(['2,0']), noClues).validLength).toBe(2);
    });

    it('accepts a matching clue and rejects a mismatched clue', () => {
        expect(evaluatePath(['0,0', '1,2'], noTowers, {'1,2': '1'}).validLength).toBe(2);
        expect(evaluatePath(['0,0', '1,2'], noTowers, {'1,2': '7'})).toEqual({
            scores: [BigInt(0)],
            validLength: 1,
        });
    });
});
