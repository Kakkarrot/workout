export type CellKey = `${number},${number}`;
export type Coordinate = readonly [x: number, y: number];
export type EntryKind = 'value' | 'note';

export type PuzzleEntry = {
    kind: EntryKind;
    text: string;
};

export type PuzzleEntries = Record<CellKey, PuzzleEntry>;

export type PuzzleCell = {
    key: CellKey;
    x: number;
    y: number;
    section: number;
    sectionColor: string;
    constant?: string;
};
