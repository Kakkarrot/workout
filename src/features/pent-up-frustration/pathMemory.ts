import type {AnalyzedPath} from './pathAnalysis';

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
