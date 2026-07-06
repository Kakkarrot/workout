import {describe, expect, it} from 'vitest';
import {analyzeSequencePaths} from './pathAnalysis';
import type {CellKey} from './types';

describe('path analysis', () => {
    it('finds shared cells across every placement of a score sequence', () => {
        const moves = Array<CellKey | null>(26).fill(null);
        moves[0] = '0,0';
        moves[1] = '2,1';
        moves[2] = '4,2';
        moves[3] = '6,2';
        moves[7] = '4,5';
        moves[12] = '0,4';
        moves[14] = '3,7';
        moves[15] = '5,7';
        moves[18] = '3,2';
        moves[19] = '2,4';
        moves[25] = '5,5';
        const displayScores = Array<bigint | undefined>(26);
        displayScores[19] = BigInt(107);

        const analysis = analyzeSequencePaths({
            moves,
            selectedMove: 19,
            displayScores,
            towerBySection: new Map([
                [10, '0,0'], [9, '2,1'], [8, '4,2'], [4, '4,5'], [11, '0,4'], [1, '3,7'],
            ]),
            sequence: [127, 2667, 2689, 2712, 113, 138].map(BigInt),
        });

        expect(analysis.paths.length).toBeGreaterThan(0);
        expect(analysis.paths[0]).toHaveLength(7);
        expect(analysis.paths[0][0]).toEqual({
            cell: '2,4',
            isTower: false,
            move: 19,
            value: '107',
        });
        expect(analysis.paths[0][6]).toEqual({
            cell: '5,5',
            isTower: false,
            move: 25,
            value: '138',
        });
        expect(analysis.sharedCells).toContain('2,4');
        expect(analysis.sharedCells).toContain('5,5');
    });
});
