'use client';

import {useMemo} from 'react';
import {BoundedCounter} from '../../components/BoundedCounter';
import {PuzzleBoard} from './PuzzleBoard';
import {PuzzleInstructions} from './PuzzleInstructions';
import {PUZZLE_ID} from './puzzleDefinition';
import {evaluateProgress} from './puzzleProgress';
import {ScoreSequenceGenerator} from './ScoreSequenceGenerator';
import {MAX_MOVE, STARTING_CELL, scoreSequenceStartFor, towerCellsFor} from './puzzleState';
import {usePuzzleBoard} from './usePuzzleBoard';

export function PuzzleGrid() {
    const {state, isLoading, isSaving, status, selectCell, selectMove, toggleErase, save} = usePuzzleBoard(PUZZLE_ID);
    const towerCells = useMemo(() => towerCellsFor(state), [state]);
    const progress = evaluateProgress(state.moves, towerCells.has(STARTING_CELL));
    const eraseMode = state.mode === 'erase';
    const scoreSequenceStart = scoreSequenceStartFor(state);

    return (
        <>
            <section className="puzzle-workspace" aria-label="Interactive puzzle grid">
                {!isLoading && (
                    <PuzzleBoard
                        moves={state.moves}
                        selectedMove={state.selectedMove}
                        scores={state.displayScores.map(score => score?.toString())}
                        towerCells={towerCells}
                        invalidMoves={progress.invalidMoves}
                        disabled={isSaving}
                        onSelectCell={selectCell}
                    />
                )}
                <div className="puzzle-modes">
                    <BoundedCounter
                        value={state.selectedMove}
                        min={1}
                        max={MAX_MOVE}
                        label="move"
                        disabled={isLoading || isSaving}
                        onChange={selectMove}
                    />
                    <button
                        className={`puzzle-mode${eraseMode ? ' puzzle-mode--active' : ''}`}
                        type="button"
                        aria-pressed={eraseMode}
                        disabled={isLoading || isSaving}
                        onClick={toggleErase}
                    >
                        Erase
                    </button>
                    <button
                        className="puzzle-mode"
                        type="button"
                        disabled={isLoading || isSaving}
                        onClick={() => void save()}
                    >
                        {isSaving ? 'Saving…' : 'Save'}
                    </button>
                </div>
                <p className="puzzle-status" aria-live="polite">{status}</p>
                <p className="puzzle-help">
                    {eraseMode
                        ? 'Select a populated square to erase that move.'
                        : 'Choose a move number, then select its square. Connected moves are verified immediately.'}
                </p>
            </section>
            {!isLoading && (
                <ScoreSequenceGenerator start={scoreSequenceStart}/>
            )}
            <PuzzleInstructions/>
        </>
    );
}
