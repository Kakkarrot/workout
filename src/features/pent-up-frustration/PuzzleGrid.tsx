'use client';

import {useMemo} from 'react';
import {PuzzleBoard} from './PuzzleBoard';
import {PUZZLE_ID} from './puzzleDefinition';
import {evaluatePath} from './puzzleRules';
import {towerCellsFor} from './puzzleState';
import {usePuzzleBoard} from './usePuzzleBoard';

export function PuzzleGrid() {
    const {state, isLoading, isSaving, status, selectCell, toggleMultiReset, save} = usePuzzleBoard(PUZZLE_ID);
    const towerCells = useMemo(() => towerCellsFor(state), [state]);
    const {scores} = evaluatePath(state.movePath, towerCells);
    const multiResetMode = state.mode === 'multiReset';

    return (
        <section className="puzzle-workspace" aria-label="Interactive puzzle grid">
            {!isLoading && (
                <PuzzleBoard
                    movePath={state.movePath}
                    scores={scores.map(score => score.toString())}
                    towerCells={towerCells}
                    disabled={isSaving}
                    onSelectCell={selectCell}
                />
            )}
            <div className="puzzle-modes">
                <button
                    className={`puzzle-mode${multiResetMode ? ' puzzle-mode--active' : ''}`}
                    type="button"
                    aria-pressed={multiResetMode}
                    disabled={isLoading || isSaving}
                    onClick={toggleMultiReset}
                >
                    Multi reset
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
                {multiResetMode
                    ? 'Select a populated square to remove it and every move after it.'
                    : 'Select squares in move order. Select the latest move to undo it.'}
            </p>
        </section>
    );
}
