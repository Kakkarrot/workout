import {availableScoresFor, availableTowersFor, evaluateProgress} from './puzzleProgress';
import {isPuzzleCell, sectionForCell} from './puzzleTopology';
import type {ScoreSequenceStart} from './scoreSequences';
import type {CellKey} from './types';

export const MAX_MARKED_SQUARES = 64;
export const MAX_MOVE = 64;
export const STARTING_CELL: CellKey = '0,0';

export type PuzzleBoardState = {
    moves: readonly (CellKey | null)[];
    displayScores: readonly (bigint | undefined)[];
    towerBySection: ReadonlyMap<number, CellKey>;
};

const startingSection = sectionForCell(STARTING_CELL);

export function createPuzzleBoardState(): PuzzleBoardState {
    return {moves: [STARTING_CELL], displayScores: [BigInt(0)], towerBySection: new Map()};
}

export function hydratePuzzleBoardState(
    moves: readonly (CellKey | null)[],
    startingCellIsTower: boolean,
    towerCells?: readonly CellKey[],
    displayScores?: readonly (bigint | undefined)[],
) {
    const populated = moves.filter((key): key is CellKey => Boolean(key));
    if (new Set(populated).size !== populated.length) return null;
    const initial = createPuzzleBoardState();
    const persistedTowers = towerCells ?? (startingCellIsTower ? [STARTING_CELL] : []);
    if (persistedTowers.some(key => !populated.includes(key))) return null;
    const towerBySection = new Map<number, CellKey>();
    for (const key of persistedTowers) {
        if (!isPuzzleCell(key)) return null;
        const section = sectionForCell(key);
        if (towerBySection.has(section)) return null;
        towerBySection.set(section, key);
    }
    if (towerBySection.has(startingSection) !== startingCellIsTower) return null;
    return rebuildBoard({...initial, towerBySection, displayScores: displayScores ?? initial.displayScores}, moves);
}

export function placeFollowingMove(board: PuzzleBoardState, activeMove: number, key: CellKey) {
    const moveToPlace = activeMove + 1;
    if (!isPuzzleCell(key)
        || moveToPlace > MAX_MOVE
        || board.moves[moveToPlace]
        || board.moves.filter(Boolean).length >= MAX_MARKED_SQUARES) return null;
    const moves = Array.from(
        {length: Math.max(board.moves.length, moveToPlace + 1)},
        (_, move) => board.moves[move] ?? null,
    );
    moves[moveToPlace] = key;
    return rebuildBoard(board, moves);
}

export function eraseMove(board: PuzzleBoardState, move: number) {
    const key = board.moves[move];
    if (!key || move === 0) return null;
    const moves = [...board.moves];
    moves[move] = null;
    const displayScores = [...board.displayScores];
    displayScores[move] = undefined;
    const towerBySection = new Map(board.towerBySection);
    for (const [section, tower] of towerBySection) {
        if (tower === key) towerBySection.delete(section);
    }
    return rebuildBoard({...board, displayScores, towerBySection}, moves);
}

export function toggleStartingTower(board: PuzzleBoardState) {
    const towerBySection = new Map(board.towerBySection);
    if (towerBySection.get(startingSection) === STARTING_CELL) towerBySection.delete(startingSection);
    else if (towerBySection.has(startingSection)) return null;
    else towerBySection.set(startingSection, STARTING_CELL);
    return rebuildBoard({...board, towerBySection}, board.moves);
}

export function towerCellsFor(board: PuzzleBoardState) {
    return new Set(board.towerBySection.values());
}

export function scoreSequenceStartFor(board: PuzzleBoardState, activeMove: number): ScoreSequenceStart | null {
    const selectedCell = board.moves[activeMove];
    const selectedScore = board.displayScores[activeMove];
    if (!selectedCell || selectedScore === undefined) return null;
    return {
        score: selectedScore,
        move: activeMove + 1,
        height: towerCellsFor(board).has(selectedCell) ? 1 : 0,
    };
}

function rebuildBoard(board: PuzzleBoardState, moves: readonly (CellKey | null)[]): PuzzleBoardState {
    const startingTower = board.towerBySection.get(startingSection) === STARTING_CELL;
    const progress = evaluateProgress(moves, startingTower);
    const displayScores = [...board.displayScores];
    progress.scores.forEach((score, move) => { displayScores[move] = score; });
    const availableScores = availableScoresFor(moves, displayScores);
    const connectedTowers = mergeDisplayedTowers(board.towerBySection, progress.path, progress.towerBySection);
    return {
        moves: trimMoves(moves),
        displayScores: availableScores,
        towerBySection: availableTowersFor(moves, availableScores, connectedTowers),
    };
}

function mergeDisplayedTowers(
    displayed: ReadonlyMap<number, CellKey>,
    verifiedPath: readonly CellKey[],
    verified: ReadonlyMap<number, CellKey>,
) {
    const pathCells = new Set(verifiedPath);
    const merged = new Map([...displayed].filter(([, cell]) => !pathCells.has(cell)));
    for (const [section, cell] of verified) merged.set(section, cell);
    return merged;
}

function trimMoves(moves: readonly (CellKey | null)[]) {
    const trimmed = [...moves];
    while (trimmed.length > 1 && trimmed.at(-1) === null) trimmed.pop();
    return trimmed;
}
