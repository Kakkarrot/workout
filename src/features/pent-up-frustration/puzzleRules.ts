import {PUZZLE_CONSTANTS} from './puzzleDefinition';
import {coordinatesFor} from './cellCoordinates';
import type {CellKey} from './types';

export type ScoreClues = Readonly<Partial<Record<CellKey, string>>>;

export type PathEvaluation = {
    scores: readonly bigint[];
    validLength: number;
};

export type MoveState = {
    score: bigint;
    tower: boolean;
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

        const next = stateAfterMove(from, to, move, {
            score: scores[move - 1],
            tower: towerCells.has(from),
        });
        if (!next || next.tower !== towerCells.has(to)) return {scores, validLength: move};

        const requiredScore = clues[to];
        if (requiredScore !== undefined && next.score !== BigInt(requiredScore)) return {scores, validLength: move};

        scores.push(next.score);
    }

    return {scores, validLength: path.length};
}

export function stateAfterMove(
    from: CellKey,
    to: CellKey,
    move: number,
    state: MoveState,
): MoveState | null {
    const tower = destinationElevation(from, to, state.tower);
    if (tower === null) return null;
    const score = scoreAfterMove(state.score, move, state.tower, tower);
    return score === null ? null : {score, tower};
}

export function scoreAfterMove(score: bigint, move: number, fromTower: boolean, toTower: boolean) {
    const multiplier = BigInt(move);

    if (fromTower === toTower) return score + multiplier;
    if (!fromTower && toTower) return score * multiplier;
    if (score % multiplier !== BigInt(0)) return null;
    return score / multiplier;
}

export function destinationElevation(from: CellKey, to: CellKey, fromIsTower: boolean) {
    const [fromX, fromY] = coordinatesFor(from);
    const [toX, toY] = coordinatesFor(to);
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
