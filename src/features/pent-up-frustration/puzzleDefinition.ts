import {assignSectionColors} from './sectionColoring';
import type {CellKey, Coordinate, PuzzleCell} from './types';

export const GRID_SIZE = 8;

const SECTION_COLORS = ['#ff9999', '#99d9ff', '#a9e6a1', '#ffe58f', '#d6b4ff'] as const;

export const PUZZLE_CONSTANTS: Readonly<Partial<Record<CellKey, string>>> = {
    '0,0': '0',
    '5,7': '37',
    '7,7': '1100',
    '3,5': '23',
    '5,5': '138',
    '0,4': '528',
    '1,3': '449',
    '4,3': '16',
    '1,2': '750',
    '3,2': '88',
    '5,2': '272',
    '6,2': '1',
};

const SECTION_LAYOUT: Readonly<Record<number, ReadonlyArray<Coordinate>>> = {
    1: [[0, 7], [1, 7], [2, 7], [3, 7], [4, 7]],
    2: [[5, 7], [6, 7], [7, 7], [7, 6], [7, 5]],
    3: [[0, 6], [1, 6], [2, 6], [0, 5], [2, 5]],
    4: [[3, 6], [4, 6], [3, 5], [4, 5], [5, 5]],
    5: [[5, 6], [6, 6], [6, 5], [6, 4], [7, 4]],
    6: [[7, 3], [7, 2], [7, 1], [6, 0], [7, 0]],
    7: [[6, 2], [5, 1], [6, 1], [4, 0], [5, 0]],
    8: [[5, 4], [5, 3], [6, 3], [4, 2], [5, 2]],
    9: [[3, 2], [2, 1], [3, 1], [4, 1], [3, 0]],
    10: [[1, 2], [1, 1], [0, 0], [1, 0], [2, 0]],
    11: [[0, 4], [0, 3], [1, 3], [0, 2], [0, 1]],
    12: [[1, 5], [1, 4], [2, 4], [2, 3], [2, 2]],
    13: [[3, 4], [4, 4], [3, 3], [4, 3]],
};

const sectionByCell = new Map<CellKey, number>(
    Object.entries(SECTION_LAYOUT).flatMap(([section, coordinates]) =>
        coordinates.map(coordinate => [toCellKey(coordinate), Number(section)]),
    ),
);

const sectionColors = assignSectionColors(SECTION_LAYOUT, SECTION_COLORS);

export const PUZZLE_CELLS: readonly PuzzleCell[] = Array.from(
    {length: GRID_SIZE * GRID_SIZE},
    (_, index) => {
        const x = index % GRID_SIZE;
        const y = GRID_SIZE - 1 - Math.floor(index / GRID_SIZE);
        const key = toCellKey([x, y]);
        const section = sectionByCell.get(key);

        if (!section) throw new Error(`Puzzle cell ${key} does not belong to a section`);

        return {
            key,
            x,
            y,
            section,
            sectionColor: sectionColors[section],
            constant: PUZZLE_CONSTANTS[key],
        };
    },
);

export function formatCoordinate(key: CellKey) {
    const [x, y] = key.split(',');
    return `(${x}, ${y})`;
}

function toCellKey([x, y]: Coordinate): CellKey {
    return `${x},${y}`;
}
