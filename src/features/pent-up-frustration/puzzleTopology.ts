import {PUZZLE_CELLS} from './puzzleDefinition';
import type {CellKey} from './types';

const sectionByCell = new Map(PUZZLE_CELLS.map(cell => [cell.key, cell.section]));

export function isPuzzleCell(key: unknown): key is CellKey {
    return typeof key === 'string' && sectionByCell.has(key as CellKey);
}

export function sectionForCell(key: CellKey) {
    const section = sectionByCell.get(key);
    if (section === undefined) throw new Error(`Unknown puzzle cell: ${key}`);
    return section;
}
