'use client';

import {useMemo, useReducer} from 'react';
import {PuzzleBoard} from './PuzzleBoard';
import {evaluatePath} from './puzzleRules';
import {createPuzzleState, puzzleReducer, towerCellsFor} from './puzzleState';

export function PuzzleGrid() {
    const [state, dispatch] = useReducer(puzzleReducer, undefined, createPuzzleState);
    const towerCells = useMemo(() => towerCellsFor(state), [state]);
    const {scores} = evaluatePath(state.movePath, towerCells);
    const multiResetMode = state.mode === 'multiReset';

    return (
        <section className="puzzle-workspace" aria-label="Interactive puzzle grid">
            <PuzzleBoard
                movePath={state.movePath}
                scores={scores.map(score => score.toString())}
                towerCells={towerCells}
                onSelectCell={key => dispatch({type: 'selectCell', key})}
            />
            <div className="puzzle-modes">
                <button
                    className={`puzzle-mode${multiResetMode ? ' puzzle-mode--active' : ''}`}
                    type="button"
                    aria-pressed={multiResetMode}
                    onClick={() => dispatch({type: 'toggleMultiReset'})}
                >
                    Multi reset
                </button>
            </div>
            <p className="puzzle-help">
                {multiResetMode
                    ? 'Select a populated square to remove it and every move after it.'
                    : 'Select squares in move order. Select the latest move to undo it.'}
            </p>
        </section>
    );
}
