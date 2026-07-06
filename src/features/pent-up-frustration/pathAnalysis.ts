import {PUZZLE_CELLS, PUZZLE_CONSTANTS} from './puzzleDefinition';
import {stateAfterMove} from './puzzleRules';
import {sectionForCell} from './puzzleTopology';
import type {ScoreSequence} from './scoreSequences';
import type {CellKey} from './types';

export type PathAnalysisInput = {
    moves: readonly (CellKey | null)[];
    selectedMove: number;
    displayScores: readonly (bigint | undefined)[];
    towerBySection: ReadonlyMap<number, CellKey>;
    sequence: ScoreSequence;
};

export type PathAnalysis = {
    sharedCells: ReadonlySet<CellKey>;
    paths: readonly AnalyzedPath[];
};

export type AnalyzedPathMove = {
    cell: CellKey;
    isTower: boolean;
    move: number;
    value: string;
};

export type AnalyzedPath = readonly AnalyzedPathMove[];

export function analyzeSequencePaths({
    moves,
    selectedMove,
    displayScores,
    towerBySection,
    sequence,
}: PathAnalysisInput): PathAnalysis {
    const startCell = moves[selectedMove];
    const startScore = displayScores[selectedMove];
    if (!startCell || startScore === undefined) return emptyAnalysis();

    const occupiedMoveByCell = new Map(
        moves.flatMap((cell, move) => cell ? [[cell, move] as const] : []),
    );
    const knownTowerCells = new Set(towerBySection.values());
    const startTower = knownTowerCells.has(startCell);
    const visited = new Set<CellKey>([startCell]);
    const paths: AnalyzedPath[] = [];
    let sharedCells: Set<CellKey> | null = null;

    function search(
        step: number,
        cell: CellKey,
        score: bigint,
        tower: boolean,
        path: AnalyzedPath,
        towers: ReadonlyMap<number, CellKey>,
    ) {
        if (step === sequence.length) {
            paths.push(path);
            const cells = new Set(path.map(pathMove => pathMove.cell));
            sharedCells = sharedCells === null
                ? cells
                : new Set([...sharedCells].filter(candidate => cells.has(candidate)));
            return;
        }

        const move = selectedMove + step + 1;
        const requiredScore = sequence[step];
        const fixedScore = displayScores[move];
        if (fixedScore !== undefined && fixedScore !== requiredScore) return;
        const fixedCell = moves[move];
        const candidates = fixedCell ? [fixedCell] : PUZZLE_CELLS.map(candidate => candidate.key);

        for (const candidate of candidates) {
            if (visited.has(candidate)) continue;
            const occupiedMove = occupiedMoveByCell.get(candidate);
            if (occupiedMove !== undefined && occupiedMove !== move) continue;
            const clue = PUZZLE_CONSTANTS[candidate];
            if (clue !== undefined && BigInt(clue) !== requiredScore) continue;

            const next = stateAfterMove(cell, candidate, move, {score, tower});
            if (!next || next.score !== requiredScore) continue;
            if (knownTowerCells.has(candidate) && !next.tower) continue;

            const nextTowers = new Map(towers);
            if (next.tower) {
                const section = sectionForCell(candidate);
                const existing = nextTowers.get(section);
                if (existing && existing !== candidate) continue;
                nextTowers.set(section, candidate);
            }

            visited.add(candidate);
            search(step + 1, candidate, next.score, next.tower, [...path, {
                cell: candidate,
                isTower: next.tower,
                move,
                value: next.score.toString(),
            }], nextTowers);
            visited.delete(candidate);
        }
    }

    search(0, startCell, startScore, startTower, [{
        cell: startCell,
        isTower: startTower,
        move: selectedMove,
        value: startScore.toString(),
    }], towerBySection);
    return {sharedCells: sharedCells ?? new Set(), paths};
}

function emptyAnalysis(): PathAnalysis {
    return {sharedCells: new Set(), paths: []};
}
