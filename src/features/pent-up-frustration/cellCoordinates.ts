import type {CellKey, Coordinate} from './types';

export function cellKey([x, y]: Coordinate): CellKey {
    return `${x},${y}`;
}

export function coordinatesFor(key: CellKey): Coordinate {
    return key.split(',').map(Number) as unknown as Coordinate;
}
