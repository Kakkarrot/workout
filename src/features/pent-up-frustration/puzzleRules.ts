import {PUZZLE_CONSTANTS} from './puzzleDefinition';
import type {CellKey} from './types';

export type ScoreClues = Readonly<Partial<Record<CellKey, string>>>;

export type PathEvaluation = {
    scores: readonly bigint[];
    validLength: number;
};

export function evaluatePath(
    path: readonly CellKey[],
    towerCells: ReadonlySet<CellKey>,
    clues: ScoreClues = PUZZLE_CONSTANTS,
): PathEvaluation {
    if (path.length === 0) return {scores: [], validLength: 0};

    const scores: bigint[] = [BigInt(0)];

    for (let move = 1; move < path.length; move += 1) {
        const from = path[move - 1];
        const to = path[move];

        const expectedElevation = destinationElevation(from, to, towerCells.has(from));
        if (expectedElevation === null || expectedElevation !== towerCells.has(to)) {
            return {scores, validLength: move};
        }

        const score = scoreMove(scores[move - 1], move, towerCells.has(from), towerCells.has(to));
        if (score === null) return {scores, validLength: move};

        const requiredScore = clues[to];
        if (requiredScore !== undefined && score !== BigInt(requiredScore)) return {scores, validLength: move};

        scores.push(score);
    }

    return {scores, validLength: path.length};
}

function scoreMove(score: bigint, move: number, fromTower: boolean, toTower: boolean) {
    const multiplier = BigInt(move);

    if (fromTower === toTower) return score + multiplier;
    if (!fromTower && toTower) return score * multiplier;
    if (score % multiplier !== BigInt(0)) return null;
    return score / multiplier;
}

export function destinationElevation(from: CellKey, to: CellKey, fromIsTower: boolean) {
    const [fromX, fromY] = coordinates(from);
    const [toX, toY] = coordinates(to);
    const xDistance = Math.abs(toX - fromX);
    const yDistance = Math.abs(toY - fromY);

    if ((xDistance === 1 && yDistance === 2) || (xDistance === 2 && yDistance === 1)) {
        return fromIsTower;
    }
    if ((xDistance === 0 && yDistance === 2) || (xDistance === 2 && yDistance === 0)) {
        return !fromIsTower;
    }
    return null;
}

function coordinates(key: CellKey) {
    return key.split(',').map(Number) as [number, number];
}
