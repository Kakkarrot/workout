export type CellKey = `${number},${number}`;
export type Coordinate = readonly [x: number, y: number];

export type PuzzleCell = {
    key: CellKey;
    x: number;
    y: number;
    section: number;
    sectionColor: string;
    constant?: string;
};
