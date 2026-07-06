import type {AnalyzedPath, AnalyzedPathMove} from './pathAnalysis';
import {stateAfterMove} from './puzzleRules';
import {sectionForCell} from './puzzleTopology';
import type {CellKey} from './types';

export type StoredPathSegment = {
    startMove: number;
    endMove: number;
    paths: readonly AnalyzedPath[];
};

export function addPathSegment(
    segments: readonly StoredPathSegment[],
    paths: readonly AnalyzedPath[],
): readonly StoredPathSegment[] {
    const firstPath = paths[0];
    const firstMove = firstPath?.[0];
    const lastMove = firstPath?.at(-1);
    if (!firstMove || !lastMove) return segments;

    return [...segments, {
        startMove: firstMove.move,
        endMove: lastMove.move,
        paths,
    }];
}

export function storedPathCount(segments: readonly StoredPathSegment[]) {
    return segments.reduce((count, segment) => count + segment.paths.length, 0);
}

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

export function simulatePathSegments(segments: readonly StoredPathSegment[]): PathSimulation | null {
    if (segments.length === 0) return null;

    const ordered = [...segments].sort((left, right) => left.startMove - right.startMove);
    const moves = new Map<number, AnalyzedPathMove>();
    const moveByCell = new Map<CellKey, number>();
    const towerBySection = new Map<number, CellKey>();
    const validPaths: AnalyzedPath[] = [];
    const validPathKeys = new Set<string>();

    function count(segmentIndex: number): bigint {
        if (segmentIndex === ordered.length) {
            const path = [...moves.values()].sort((left, right) => left.move - right.move);
            const key = path.map(move => (
                `${move.move}:${move.cell}:${move.value}:${move.isTower ? 'tower' : 'ground'}`
            )).join('|');
            if (validPathKeys.has(key)) return BigInt(0);
            validPathKeys.add(key);
            validPaths.push(path);
            return BigInt(1);
        }

        let total = BigInt(0);
        for (const path of ordered[segmentIndex].paths) {
            const addedMoves: number[] = [];
            const addedCells: CellKey[] = [];
            const addedTowerSections: number[] = [];

            if (addPath(path, moves, moveByCell, towerBySection, addedMoves, addedCells, addedTowerSections)) {
                total += count(segmentIndex + 1);
            }

            addedMoves.forEach(move => moves.delete(move));
            addedCells.forEach(cell => moveByCell.delete(cell));
            addedTowerSections.forEach(section => towerBySection.delete(section));
        }
        return total;
    }

    return {
        startMove: Math.min(...ordered.map(segment => segment.startMove)),
        endMove: Math.max(...ordered.map(segment => segment.endMove)),
        validPathCount: count(0),
        paths: validPaths,
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

function addPath(
    path: AnalyzedPath,
    moves: Map<number, AnalyzedPathMove>,
    moveByCell: Map<CellKey, number>,
    towerBySection: Map<number, CellKey>,
    addedMoves: number[],
    addedCells: CellKey[],
    addedTowerSections: number[],
) {
    for (const pathMove of path) {
        const existingMove = moves.get(pathMove.move);
        if (existingMove) {
            if (!sameMove(existingMove, pathMove)) return false;
            continue;
        }

        const occupyingMove = moveByCell.get(pathMove.cell);
        if (occupyingMove !== undefined && occupyingMove !== pathMove.move) return false;

        if (pathMove.isTower) {
            const section = sectionForCell(pathMove.cell);
            const tower = towerBySection.get(section);
            if (tower && tower !== pathMove.cell) return false;
            if (!tower) {
                towerBySection.set(section, pathMove.cell);
                addedTowerSections.push(section);
            }
        }

        moves.set(pathMove.move, pathMove);
        moveByCell.set(pathMove.cell, pathMove.move);
        addedMoves.push(pathMove.move);
        addedCells.push(pathMove.cell);
    }

    return addedMoves.every(move => adjacentMovesAreValid(move, moves));
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
