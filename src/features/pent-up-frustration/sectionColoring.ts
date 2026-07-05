import type {CellKey, Coordinate} from './types';

export function assignSectionColors(
    sections: Readonly<Record<number, ReadonlyArray<Coordinate>>>,
    palette: readonly string[],
): Record<number, string> {
    const sectionIds = Object.keys(sections).map(Number);
    const sectionByCell = new Map<CellKey, number>();
    const neighbors = new Map(sectionIds.map(section => [section, new Set<number>()]));

    for (const [section, coordinates] of Object.entries(sections)) {
        for (const coordinate of coordinates) {
            sectionByCell.set(toCellKey(coordinate), Number(section));
        }
    }

    for (const [key, section] of sectionByCell) {
        const [x, y] = key.split(',').map(Number);
        for (const neighborKey of [`${x + 1},${y}`, `${x},${y + 1}`] as CellKey[]) {
            const neighbor = sectionByCell.get(neighborKey);
            if (neighbor && neighbor !== section) {
                neighbors.get(section)!.add(neighbor);
                neighbors.get(neighbor)!.add(section);
            }
        }
    }

    const coloringOrder = sectionIds.sort((a, b) =>
        neighbors.get(b)!.size - neighbors.get(a)!.size || a - b,
    );
    const assignments: Record<number, number> = {};

    function assign(index: number): boolean {
        if (index === coloringOrder.length) return true;

        const section = coloringOrder[index];
        const unavailable = new Set(
            Array.from(neighbors.get(section)!).map(neighbor => assignments[neighbor]),
        );

        for (let color = 0; color < palette.length; color++) {
            if (unavailable.has(color)) continue;
            assignments[section] = color;
            if (assign(index + 1)) return true;
            delete assignments[section];
        }

        return false;
    }

    if (!assign(0)) {
        throw new Error('The section palette cannot color this puzzle layout');
    }

    return Object.fromEntries(sectionIds.map(section => [section, palette[assignments[section]]]));
}

function toCellKey([x, y]: Coordinate): CellKey {
    return `${x},${y}`;
}
