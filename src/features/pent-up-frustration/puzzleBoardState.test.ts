import {describe, expect, it} from 'vitest';
import {
    MAX_MOVE,
    createPuzzleBoardState,
    eraseMove,
    placeFollowingMove,
    scoreSequenceStartFor,
    toggleStartingTower,
    towerCellsFor,
    hydratePuzzleBoardState,
} from './puzzleBoardState';

describe('puzzle board state', () => {
    it('places only the move following the active move', () => {
        const initial = createPuzzleBoardState();
        const moveOne = placeFollowingMove(initial, 0, '2,1');
        const moveTwo = moveOne && placeFollowingMove(moveOne, 1, '4,2');

        expect(moveTwo?.moves).toEqual(['0,0', '2,1', '4,2']);
        expect(placeFollowingMove(moveTwo!, 1, '6,3')).toBeNull();
        expect(placeFollowingMove(initial, MAX_MOVE, '7,7')).toBeNull();
        expect(placeFollowingMove(initial, 0, '0,-2')).toBeNull();
    });

    it('erases one move while preserving later board projections', () => {
        const moveOne = placeFollowingMove(createPuzzleBoardState(), 0, '0,2')!;
        const moveTwo = placeFollowingMove(moveOne, 1, '1,4')!;
        const erased = eraseMove(moveTwo, 1)!;

        expect(erased.moves).toEqual(['0,0', null, '1,4']);
        expect(towerCellsFor(erased)).toEqual(new Set(['1,4']));
        expect(eraseMove(erased, 0)).toBeNull();
        expect(eraseMove(erased, 1)).toBeNull();
    });

    it('toggles the starting tower without violating its section', () => {
        const withTower = toggleStartingTower(createPuzzleBoardState())!;
        expect(towerCellsFor(withTower)).toEqual(new Set(['0,0']));
        expect(towerCellsFor(toggleStartingTower(withTower)!)).toEqual(new Set());
        expect(toggleStartingTower({...withTower, towerBySection: new Map([[10, '1,0']])})).toBeNull();
    });

    it('builds generator context only for moves with scores', () => {
        const moveOne = placeFollowingMove(createPuzzleBoardState(), 0, '2,1')!;
        expect(scoreSequenceStartFor(moveOne, 1)).toEqual({score: BigInt(1), move: 2, height: 0});
        expect(scoreSequenceStartFor(moveOne, 2)).toBeNull();
    });

    it('hydrates sparse persisted boards without interaction actions', () => {
        const hydrated = hydratePuzzleBoardState(['0,0', null, '4,2'], true);
        expect(hydrated?.moves).toEqual(['0,0', null, '4,2']);
        expect(towerCellsFor(hydrated!)).toContain('0,0');
        expect(hydratePuzzleBoardState(['0,0', '2,1', '2,1'], false)).toBeNull();
    });
});
