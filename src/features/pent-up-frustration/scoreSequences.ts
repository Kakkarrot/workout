export type ScoreSequence = readonly bigint[];
export const MAX_SCORE_STEPS = 10;
export type ScoreSequenceStart = Readonly<{
    score: bigint;
    move: number;
    height: 0 | 1;
}>;

export function generateScoresForward(
    currentScore: bigint,
    currentMove: number,
    currentHeight: 0 | 1,
    steps: number,
): ScoreSequence[] {
    if (!Number.isInteger(steps) || steps < 0 || steps > MAX_SCORE_STEPS) {
        throw new RangeError(`Steps must be a non-negative integer no greater than ${MAX_SCORE_STEPS}`);
    }

    const results: ScoreSequence[] = [];

    function recurse(score: bigint, move: number, height: number, remaining: number, scores: bigint[]) {
        if (remaining === 0) {
            results.push(scores);
            return;
        }

        const n = BigInt(move);
        recurse(score + n, move + 1, height, remaining - 1, [...scores, score + n]);

        if (height === 0) {
            recurse(score * n, move + 1, 1, remaining - 1, [...scores, score * n]);
        }

        if (height === 1 && score % n === BigInt(0)) {
            recurse(score / n, move + 1, 0, remaining - 1, [...scores, score / n]);
        }
    }

    recurse(currentScore, currentMove, currentHeight, steps, []);
    return results.sort((a, b) => compareBigInts(a[a.length - 1]!, b[b.length - 1]!));
}

function compareBigInts(a: bigint, b: bigint) {
    if (a === b) return 0;
    return a < b ? -1 : 1;
}
