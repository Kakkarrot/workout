import {PUZZLE_CONSTANTS} from './puzzleDefinition';
import {sectionForCell} from './puzzleTopology';
import {destinationElevation, evaluatePath, scoreAfterMove} from './puzzleRules';
import type {CellKey} from './types';

export type PuzzleProgress = {
    path: readonly CellKey[];
    scores: readonly bigint[];
    towerBySection: ReadonlyMap<number, CellKey>;
    invalidMoves: ReadonlySet<number>;
};

export function evaluateProgress(
    moves: readonly (CellKey | null)[],
    startingTower: boolean,
): PuzzleProgress {
    const path = connectedPath(moves);
    const towers = inferTowers(path, startingTower);
    const verifiedPath = path.slice(0, towers.validLength);
    const evaluation = evaluatePath(verifiedPath, new Set(towers.towerBySection.values()));
    const invalidMoves = invalidGeometryMoves(moves);
    if (towers.validLength < path.length) invalidMoves.add(towers.validLength);
    else if (evaluation.validLength < path.length) invalidMoves.add(evaluation.validLength);
    return {path, scores: evaluation.scores, towerBySection: towers.towerBySection, invalidMoves};
}

export function connectedPath(moves: readonly (CellKey | null)[]) {
    const normalizedMoves = Array.from(moves);
    const gap = normalizedMoves.findIndex(key => key == null);
    return normalizedMoves.slice(0, gap < 0 ? normalizedMoves.length : gap) as CellKey[];
}

export function availableScoresFor(
    moves: readonly (CellKey | null)[],
    displayedScores: readonly (bigint | undefined)[],
) {
    const scores = [...displayedScores];
    for (let move = 0; move < moves.length; move += 1) {
        const cell = moves[move];
        const clue = cell ? PUZZLE_CONSTANTS[cell] : undefined;
        if (clue !== undefined) scores[move] = BigInt(clue);
    }

    propagateScoresForward(moves, scores);
    propagateScoresBackward(moves, scores);
    return scores;
}

type ScoreCandidate = {score: bigint; tower: boolean};

function propagateScoresForward(
    moves: readonly (CellKey | null)[],
    scores: (bigint | undefined)[],
) {
    let candidates: ScoreCandidate[] = [];
    for (let move = 0; move < moves.length; move += 1) {
        const cell = moves[move];
        if (!cell) {
            candidates = [];
            continue;
        }
        if (move > 0 && moves[move - 1] && candidates.length > 0) {
            const from = moves[move - 1] as CellKey;
            candidates = candidates.flatMap(candidate => {
                const tower = destinationElevation(from, cell, candidate.tower);
                if (tower === null) return [];
                const score = scoreAfterMove(candidate.score, move, candidate.tower, tower);
                return score === null ? [] : [{score, tower}];
            });
        }
        const knownScore = scores[move];
        if (knownScore !== undefined) {
            candidates = candidates.filter(candidate => candidate.score === knownScore);
            if (candidates.length === 0) candidates = heightsFor(knownScore);
        } else if (candidates.length > 0 && candidates.every(candidate => candidate.score === candidates[0].score)) {
            scores[move] = candidates[0].score;
        }
    }
}

function propagateScoresBackward(
    moves: readonly (CellKey | null)[],
    scores: (bigint | undefined)[],
) {
    let candidates: ScoreCandidate[] = [];
    for (let move = moves.length - 1; move >= 0; move -= 1) {
        const cell = moves[move];
        if (!cell) {
            candidates = [];
            continue;
        }
        if (move < moves.length - 1 && moves[move + 1] && candidates.length > 0) {
            const to = moves[move + 1] as CellKey;
            candidates = candidates.flatMap(candidate => ([false, true] as const).flatMap(tower => {
                if (destinationElevation(cell, to, tower) !== candidate.tower) return [];
                const score = scoreBeforeMove(candidate.score, move + 1, tower, candidate.tower);
                return score === null ? [] : [{score, tower}];
            }));
        }
        const knownScore = scores[move];
        if (knownScore !== undefined) {
            candidates = candidates.filter(candidate => candidate.score === knownScore);
            if (candidates.length === 0) candidates = heightsFor(knownScore);
        } else if (candidates.length > 0 && candidates.every(candidate => candidate.score === candidates[0].score)) {
            scores[move] = candidates[0].score;
        }
    }
}

function heightsFor(score: bigint): ScoreCandidate[] {
    return [{score, tower: false}, {score, tower: true}];
}

export function availableTowersFor(
    moves: readonly (CellKey | null)[],
    scores: readonly (bigint | undefined)[],
    displayed: ReadonlyMap<number, CellKey>,
) {
    const available = new Map(displayed);
    const displayedCells = new Set(displayed.values());

    for (const segment of disconnectedSegments(moves)) {
        const candidates = ([false, true] as const).flatMap(startingTower => {
            const heights = new Map<number, boolean>([[segment[0], startingTower]]);
            const towerBySection = new Map<number, CellKey>();

            for (let index = 0; index < segment.length; index += 1) {
                const move = segment[index];
                const cell = moves[move] as CellKey;
                const isTower = heights.get(move) as boolean;
                if (displayedCells.has(cell) && !isTower) return [];
                if (isTower) {
                    const section = sectionForCell(cell);
                    const existing = available.get(section) ?? towerBySection.get(section);
                    if (existing && existing !== cell) return [];
                    towerBySection.set(section, cell);
                }
                if (index === segment.length - 1) continue;

                const nextMove = segment[index + 1];
                const nextCell = moves[nextMove] as CellKey;
                const nextTower = destinationElevation(cell, nextCell, isTower);
                if (nextTower === null) return [];
                const fromScore = scores[move];
                const toScore = scores[nextMove];
                if (fromScore !== undefined && toScore !== undefined
                    && scoreAfterMove(fromScore, nextMove, isTower, nextTower) !== toScore) return [];
                heights.set(nextMove, nextTower);
            }
            return [{heights, towerBySection}];
        });

        for (const move of segment) {
            if (candidates.length > 0 && candidates.every(candidate => candidate.heights.get(move))) {
                const cell = moves[move] as CellKey;
                available.set(sectionForCell(cell), cell);
            }
        }
    }
    return available;
}

function disconnectedSegments(moves: readonly (CellKey | null)[]) {
    const segments: number[][] = [];
    let segment: number[] = [];
    let sawGap = false;
    for (let move = 0; move < moves.length; move += 1) {
        if (!moves[move]) {
            if (segment.length > 0 && sawGap) segments.push(segment);
            segment = [];
            sawGap = true;
        } else if (sawGap) segment.push(move);
    }
    if (segment.length > 0 && sawGap) segments.push(segment);
    return segments;
}

function scoreBeforeMove(score: bigint, move: number, fromTower: boolean, toTower: boolean) {
    const multiplier = BigInt(move);
    if (fromTower === toTower) return score - multiplier;
    if (!fromTower && toTower) return score % multiplier === BigInt(0) ? score / multiplier : null;
    return score * multiplier;
}

function inferTowers(path: readonly CellKey[], startingTower: boolean) {
    const towerBySection = new Map<number, CellKey>();
    if (startingTower && path[0]) towerBySection.set(sectionForCell(path[0]), path[0]);

    for (let move = 1; move < path.length; move += 1) {
        const from = path[move - 1];
        const to = path[move];
        const towers = new Set(towerBySection.values());
        const toIsTower = destinationElevation(from, to, towers.has(from));
        if (toIsTower === null) return {towerBySection, validLength: move};
        if (!toIsTower) continue;

        const section = sectionForCell(to);
        if (towerBySection.has(section)) return {towerBySection, validLength: move};
        towerBySection.set(section, to);
    }
    return {towerBySection, validLength: path.length};
}

function invalidGeometryMoves(moves: readonly (CellKey | null)[]) {
    const invalidMoves = new Set<number>();
    for (let move = 1; move < moves.length; move += 1) {
        const from = moves[move - 1];
        const to = moves[move];
        if (from && to && destinationElevation(from, to, false) === null) invalidMoves.add(move);
    }
    return invalidMoves;
}
