import type {AnalyzedPath, AnalyzedPathMove} from './pathAnalysis';
import type {StoredPathSegment} from './pathMemory';
import {stateAfterMove} from './puzzleRules';
import {sectionForCell} from './puzzleTopology';
import type {CellKey} from './types';

export type PathSimulation = {
    startMove: number;
    endMove: number;
    validPathCount: bigint;
    paths: readonly AnalyzedPath[];
};

export type PathSimulationSummary = {
    alwaysTowerCells: ReadonlySet<CellKey>;
    fixedValuesByCell: ReadonlyMap<CellKey, string>;
};

type Combination = {
    moves: ReadonlyMap<number, AnalyzedPathMove>;
    moveByCell: ReadonlyMap<CellKey, number>;
    towerBySection: ReadonlyMap<number, CellKey>;
};

const EMPTY_COMBINATION: Combination = {
    moves: new Map(),
    moveByCell: new Map(),
    towerBySection: new Map(),
};

export function simulatePathSegments(segments: readonly StoredPathSegment[]): PathSimulation | null {
    if (segments.length === 0) return null;

    const ordered = [...segments].sort((left, right) => left.startMove - right.startMove);
    const pathByKey = new Map<string, AnalyzedPath>();

    function combine(segmentIndex: number, combination: Combination) {
        if (segmentIndex === ordered.length) {
            const path = [...combination.moves.values()].sort((left, right) => left.move - right.move);
            pathByKey.set(pathKey(path), path);
            return;
        }

        for (const path of ordered[segmentIndex].paths) {
            const merged = mergePath(combination, path);
            if (merged) combine(segmentIndex + 1, merged);
        }
    }

    combine(0, EMPTY_COMBINATION);
    const paths = [...pathByKey.values()];
    return {
        startMove: Math.min(...ordered.map(segment => segment.startMove)),
        endMove: Math.max(...ordered.map(segment => segment.endMove)),
        validPathCount: BigInt(paths.length),
        paths,
    };
}

export function summarizeSimulatedPaths(
    paths: readonly AnalyzedPath[],
    excludedCells: ReadonlySet<CellKey> = new Set(),
): PathSimulationSummary {
    const firstPath = paths[0];
    if (!firstPath) return {alwaysTowerCells: new Set(), fixedValuesByCell: new Map()};

    const availableMoves = firstPath.filter(move => !excludedCells.has(move.cell));
    const alwaysTowerCells = new Set(availableMoves.filter(move => move.isTower).map(move => move.cell));
    const fixedValuesByCell = new Map(availableMoves.map(move => [move.cell, move.value]));

    for (const path of paths.slice(1)) {
        const moveByCell = new Map(path.map(move => [move.cell, move]));
        for (const cell of alwaysTowerCells) {
            if (!moveByCell.get(cell)?.isTower) alwaysTowerCells.delete(cell);
        }
        for (const [cell, value] of fixedValuesByCell) {
            if (moveByCell.get(cell)?.value !== value) fixedValuesByCell.delete(cell);
        }
    }

    return {alwaysTowerCells, fixedValuesByCell};
}

function mergePath(combination: Combination, path: AnalyzedPath): Combination | null {
    const moves = new Map(combination.moves);
    const moveByCell = new Map(combination.moveByCell);
    const towerBySection = new Map(combination.towerBySection);

    for (const pathMove of path) {
        const existingMove = moves.get(pathMove.move);
        if (existingMove) {
            if (!sameMove(existingMove, pathMove)) return null;
            continue;
        }
        if (moveByCell.has(pathMove.cell)) return null;

        if (pathMove.isTower) {
            const section = sectionForCell(pathMove.cell);
            const tower = towerBySection.get(section);
            if (tower && tower !== pathMove.cell) return null;
            towerBySection.set(section, pathMove.cell);
        }

        moves.set(pathMove.move, pathMove);
        moveByCell.set(pathMove.cell, pathMove.move);
    }

    if (!path.every(pathMove => adjacentMovesAreValid(pathMove.move, moves))) return null;
    return {moves, moveByCell, towerBySection};
}

function pathKey(path: AnalyzedPath) {
    return path.map(move => (
        `${move.move}:${move.cell}:${move.value}:${move.isTower ? 'tower' : 'ground'}`
    )).join('|');
}

function sameMove(left: AnalyzedPathMove, right: AnalyzedPathMove) {
    return left.cell === right.cell && left.isTower === right.isTower && left.value === right.value;
}

function adjacentMovesAreValid(move: number, moves: ReadonlyMap<number, AnalyzedPathMove>) {
    return transitionIsValid(moves.get(move - 1), moves.get(move), move)
        && transitionIsValid(moves.get(move), moves.get(move + 1), move + 1);
}

function transitionIsValid(from: AnalyzedPathMove | undefined, to: AnalyzedPathMove | undefined, move: number) {
    if (!from || !to) return true;
    const next = stateAfterMove(from.cell, to.cell, move, {
        score: BigInt(from.value),
        tower: from.isTower,
    });
    return next?.score === BigInt(to.value) && next.tower === to.isTower;
}
