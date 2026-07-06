import {describe, expect, it} from 'vitest';
import {addPathSegment, storedPathCount} from './pathMemory';
import type {AnalyzedPath} from './pathAnalysis';

describe('path memory', () => {
    it('preserves paths as analyzed segments and counts their routes', () => {
        const firstPaths: readonly AnalyzedPath[] = [
            [
                {cell: '2,1', isTower: true, move: 1, value: '1'},
                {cell: '4,2', isTower: true, move: 2, value: '3'},
            ],
            [
                {cell: '2,1', isTower: true, move: 1, value: '1'},
                {cell: '0,2', isTower: true, move: 2, value: '3'},
            ],
        ];
        const secondPaths: readonly AnalyzedPath[] = [[
            {cell: '3,2', isTower: false, move: 18, value: '88'},
            {cell: '2,4', isTower: false, move: 19, value: '107'},
        ]];

        const segments = addPathSegment(addPathSegment([], firstPaths), secondPaths);

        expect(segments).toEqual([
            {startMove: 1, endMove: 2, paths: firstPaths},
            {startMove: 18, endMove: 19, paths: secondPaths},
        ]);
        expect(storedPathCount(segments)).toBe(3);
    });

    it('ignores an empty analysis', () => {
        const segments = addPathSegment([], []);

        expect(segments).toEqual([]);
    });
});
