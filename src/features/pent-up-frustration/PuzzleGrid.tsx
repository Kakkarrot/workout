'use client';

import {useMemo, useReducer} from 'react';
import {PuzzleBoard} from './PuzzleBoard';
import {evaluatePath} from './puzzleRules';
import {createPuzzleState, puzzleReducer, towerCellsFor} from './puzzleState';

export function PuzzleGrid() {
    const [state, dispatch] = useReducer(puzzleReducer, undefined, createPuzzleState);
    const towerCells = useMemo(() => towerCellsFor(state), [state]);
    const {scores} = evaluatePath(state.movePath, towerCells);
    const towerMode = state.mode === 'towers';
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
                    className={`puzzle-mode${towerMode ? ' puzzle-mode--active' : ''}`}
                    type="button"
                    aria-pressed={towerMode}
                    onClick={() => dispatch({type: 'toggleMode', mode: 'towers'})}
                >
                    Place towers
                </button>
                <button
                    className={`puzzle-mode${multiResetMode ? ' puzzle-mode--active' : ''}`}
                    type="button"
                    aria-pressed={multiResetMode}
                    onClick={() => dispatch({type: 'toggleMode', mode: 'multiReset'})}
                >
                    Multi reset
                </button>
            </div>
            <p className="puzzle-help">
                {towerMode
                    ? 'Select a square to add or remove a tower. Each colored section can have one tower.'
                    : multiResetMode
                        ? 'Select any earlier move to reset the path to that square.'
                        : 'Select squares in move order. Select the previous move to undo one step.'}
            </p>
        </section>
    );
}
