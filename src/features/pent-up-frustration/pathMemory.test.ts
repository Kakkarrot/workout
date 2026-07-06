import {describe, expect, it} from 'vitest';
import {addPathSegment, simulatePathSegments, storedPathCount, summarizeSimulatedPaths} from './pathMemory';
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

    it('counts compatible combinations across segments with a shared boundary move', () => {
        const first = addPathSegment([], [
            path(move(3, '0,0', '10'), move(4, '1,2', '14')),
            path(move(3, '2,0', '10'), move(4, '3,2', '14')),
        ]);
        const segments = addPathSegment(first, [
            path(move(4, '1,2', '14'), move(5, '2,4', '19')),
            path(move(4, '3,2', '14'), move(5, '4,4', '19')),
        ]);

        const simulation = simulatePathSegments(segments);

        expect(simulation).toMatchObject({
            startMove: 3,
            endMove: 5,
            validPathCount: BigInt(2),
        });
        expect(simulation?.paths).toEqual([
            [move(3, '0,0', '10'), move(4, '1,2', '14'), move(5, '2,4', '19')],
            [move(3, '2,0', '10'), move(4, '3,2', '14'), move(5, '4,4', '19')],
        ]);
    });

    it('rejects combinations that reuse a square at different moves', () => {
        const first = addPathSegment([], [path(move(3, '0,0', '10'), move(4, '1,2', '14'))]);
        const segments = addPathSegment(first, [path(move(8, '0,0', '30'), move(9, '2,1', '39'))]);

        expect(simulatePathSegments(segments)?.validPathCount).toBe(BigInt(0));
    });

    it('finds squares that are towers or fixed values in every simulated path', () => {
        const paths: readonly AnalyzedPath[] = [
            [
                {...move(3, '0,0', '10'), isTower: true},
                move(4, '1,2', '14'),
                move(5, '2,4', '19'),
            ],
            [
                {...move(3, '0,0', '10'), isTower: true},
                move(4, '1,2', '99'),
                move(5, '4,4', '19'),
            ],
        ];

        const summary = summarizeSimulatedPaths(paths);

        expect(summary.alwaysTowerCells).toEqual(new Set(['0,0']));
        expect(summary.fixedValuesByCell).toEqual(new Map([['0,0', '10']]));
    });

    it('excludes cells that are already populated on the board from the summary', () => {
        const paths = [[
            {...move(3, '0,0', '10'), isTower: true},
            move(4, '1,2', '14'),
        ]];

        const summary = summarizeSimulatedPaths(paths, new Set(['0,0']));

        expect(summary.alwaysTowerCells).toEqual(new Set());
        expect(summary.fixedValuesByCell).toEqual(new Map([['1,2', '14']]));
    });

    it('counts identical composed paths only once', () => {
        const duplicate = path(move(3, '0,0', '10'), move(4, '1,2', '14'));
        const segments = addPathSegment(addPathSegment([], [duplicate, duplicate]), [
            path(move(4, '1,2', '14'), move(5, '2,4', '19')),
        ]);

        const simulation = simulatePathSegments(segments);

        expect(simulation?.validPathCount).toBe(BigInt(1));
        expect(simulation?.paths).toHaveLength(1);
    });
});

function move(moveNumber: number, cell: AnalyzedPath[number]['cell'], value: string): AnalyzedPath[number] {
    return {cell, isTower: false, move: moveNumber, value};
}

function path(...moves: AnalyzedPath[number][]): AnalyzedPath {
    return moves;
}
