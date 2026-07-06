import {cellKey} from './cellCoordinates';
import {GRID_SIZE} from './puzzleDefinition';
import type {CellKey} from './types';

export function calculatePuzzleAnswer(
    moves: readonly (CellKey | null)[],
    scores: readonly (bigint | undefined)[],
): bigint | null {
    const scoreByCell = new Map<CellKey, bigint>();
    for (let move = 0; move < moves.length; move += 1) {
        const cell = moves[move];
        if (!cell) continue;
        const score = scores[move];
        if (score === undefined) return null;
        scoreByCell.set(cell, score);
    }

    let answer = BigInt(0);
    for (let y = 0; y < GRID_SIZE; y += 1) {
        for (let x = 0; x < GRID_SIZE; x += 1) {
            const cell = cellKey([x, y]);
            if (scoreByCell.has(cell)) continue;

            for (const [neighborX, neighborY] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
                if (neighborX < 0 || neighborX >= GRID_SIZE || neighborY < 0 || neighborY >= GRID_SIZE) continue;
                answer += scoreByCell.get(cellKey([neighborX, neighborY])) ?? BigInt(0);
            }
        }
    }
    return answer;
}
