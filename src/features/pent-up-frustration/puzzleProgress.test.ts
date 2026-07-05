import {describe, expect, it} from 'vitest';
import {PUZZLE_CELLS} from './puzzleDefinition';
import {destinationElevation} from './puzzleRules';
import {availableScoresFor, availableTowersFor, evaluateProgress} from './puzzleProgress';
import type {CellKey} from './types';

const sectionByCell = new Map(PUZZLE_CELLS.map(cell => [cell.key, cell.section]));

describe('puzzle progress', () => {
    it('propagates scores through a detached segment anchored by a clue', () => {
        const moves = ['0,0', null, null, null, null, null, '6,2', '4,1'] as const;
        expect(availableScoresFor(moves, [BigInt(0)]).slice(6)).toEqual([BigInt(1), BigInt(8)]);
    });

    it('carries inferred elevation across multiple detached vertical moves', () => {
        const moves = ['0,0', null, null, null, null, null, '4,3', '4,5', '4,7'] as const;
        expect(availableScoresFor(moves, [BigInt(0)]).slice(6)).toEqual([
            BigInt(16),
            BigInt(112),
            BigInt(14),
        ]);
    });

    it('propagates scores backward from a later clue in a detached segment', () => {
        const moves = ['0,0', null, null, null, null, null, '3,6', '5,7'] as const;
        expect(availableScoresFor(moves, [BigInt(0)]).slice(6)).toEqual([BigInt(30), BigInt(37)]);
    });

    it('keeps ambiguous backward vertical scores unknown', () => {
        const moves = ['0,0', null, null, null, null, '7,5', '5,5'] as const;
        expect(availableScoresFor(moves, [BigInt(0)])[5]).toBeUndefined();
    });

    it('uses the only divisible backward vertical score', () => {
        const moves = ['0,0', null, null, null, null, '6,0', '6,2'] as const;
        expect(availableScoresFor(moves, [BigInt(0)])[5]).toBe(BigInt(6));
    });

    it('leaves a detached height-dependent score unknown when outcomes differ', () => {
        const moves = ['0,0', null, null, null, null, '5,5', '7,5'] as const;
        expect(availableScoresFor(moves, [BigInt(0)])[6]).toBeUndefined();
    });

    it('infers a detached tower when scores determine the elevation', () => {
        const moves = ['0,0', null, null, null, null, null, '6,2', '6,0'] as const;
        const scores = availableScoresFor(moves, [BigInt(0)]);
        expect(availableTowersFor(moves, scores, new Map()).get(6)).toBe('6,0');
    });

    it('does not mark ambiguous detached planar elevations as towers', () => {
        const moves = ['0,0', null, '4,1', '6,2'] as const;
        expect(availableTowersFor(moves, [], new Map())).toEqual(new Map());
    });

    it('evaluates multiple detached segments separated by gaps', () => {
        const moves = ['0,0', null, '4,1', null, '6,2'] as const;
        expect(availableTowersFor(moves, [], new Map())).toEqual(new Map());
    });

    it('rejects detached elevation candidates with invalid geometry', () => {
        const moves = ['0,0', null, '1,1', '1,2'] as const;
        expect(availableTowersFor(moves, [], new Map())).toEqual(new Map());
    });

    it('rejects a connected path that requires two towers in one section', () => {
        const path = pathWithRepeatedTowerSection();
        expect(path).not.toBeNull();
        expect(evaluateProgress({
            moves: path as CellKey[],
            towerBySection: new Map(),
        }).invalidMoves).toContain(path!.length - 1);
    });

    it('rejects a detached move that continues a tower into an occupied section', () => {
        const moves = Array<CellKey | null>(24).fill(null);
        moves[0] = '0,0';
        moves[7] = '4,5';
        moves[21] = '5,0';
        moves[22] = '7,1';
        moves[23] = '6,3';
        const displayedTowers = new Map<number, CellKey>([
            [8, '4,5'],
            [7, '5,0'],
            [6, '7,1'],
        ]);

        expect(evaluateProgress({moves, towerBySection: displayedTowers}).invalidMoves).toContain(23);
    });

});

function pathWithRepeatedTowerSection() {
    type SearchState = {
        path: CellKey[];
        towerCells: Set<CellKey>;
        towerSections: Set<number>;
    };
    const pending: SearchState[] = [{path: ['0,0'], towerCells: new Set(), towerSections: new Set()}];

    while (pending.length > 0) {
        const current = pending.pop() as SearchState;
        if (current.path.length >= 12) continue;
        const from = current.path.at(-1) as CellKey;

        for (const cell of PUZZLE_CELLS) {
            if (current.path.includes(cell.key)) continue;
            const toIsTower = destinationElevation(from, cell.key, current.towerCells.has(from));
            if (toIsTower === null) continue;
            const section = sectionByCell.get(cell.key) as number;
            if (toIsTower && current.towerSections.has(section)) return [...current.path, cell.key];

            const towerCells = new Set(current.towerCells);
            const towerSections = new Set(current.towerSections);
            if (toIsTower) {
                towerCells.add(cell.key);
                towerSections.add(section);
            }
            pending.push({path: [...current.path, cell.key], towerCells, towerSections});
        }
    }
    return null;
}
