import {describe, expect, it} from 'vitest';
import {
    GRID_SIZE,
    PUZZLE_CELLS,
    PUZZLE_CONSTANTS,
    SECTION_LAYOUT,
    buildPuzzleCells,
    formatCoordinate,
} from './puzzleDefinition';

describe('puzzle definition', () => {
    it('maps every board coordinate to exactly one region', () => {
        expect(PUZZLE_CELLS).toHaveLength(GRID_SIZE * GRID_SIZE);
        expect(new Set(PUZZLE_CELLS.map(cell => cell.key)).size).toBe(GRID_SIZE * GRID_SIZE);
        expect(new Set(PUZZLE_CELLS.map(cell => cell.section))).toEqual(
            new Set(Object.keys(SECTION_LAYOUT).map(Number)),
        );
    });

    it('orders cells from the top-left to the bottom-right', () => {
        expect(PUZZLE_CELLS[0].key).toBe('0,7');
        expect(PUZZLE_CELLS.at(-1)?.key).toBe('7,0');
    });

    it('attaches constants and formats coordinates', () => {
        expect(PUZZLE_CELLS.find(cell => cell.key === '5,7')?.constant).toBe(PUZZLE_CONSTANTS['5,7']);
        expect(formatCoordinate('5,7')).toBe('(5, 7)');
    });

    it('builds an injectable puzzle definition', () => {
        expect(buildPuzzleCells(1, {1: [[0, 0]]}, ['red'], {'0,0': '12'})).toEqual([
            {key: '0,0', x: 0, y: 0, section: 1, sectionColor: 'red', constant: '12'},
        ]);
    });

    it('rejects a definition with an unassigned square', () => {
        expect(() => buildPuzzleCells(1, {}, ['red'], {})).toThrow(
            'Puzzle cell 0,0 does not belong to a section',
        );
    });
});
