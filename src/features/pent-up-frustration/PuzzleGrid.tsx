'use client';

import {useMemo} from 'react';
import {PuzzleBoard} from './PuzzleBoard';
import {PuzzleControls} from './PuzzleControls';
import {PuzzleInstructions} from './PuzzleInstructions';
import {PUZZLE_ID} from './puzzleDefinition';
import {calculatePuzzleAnswer} from './puzzleAnswer';
import {evaluateProgress} from './puzzleProgress';
import {ScoreSequenceGenerator} from './ScoreSequenceGenerator';
import {scoreSequenceStartFor, towerCellsFor} from './puzzleState';
import {usePathAnalysis} from './usePathAnalysis';
import {usePuzzleBoard} from './usePuzzleBoard';

export function PuzzleGrid() {
    const {state, isLoading, isSaving, status, selectCell, toggleErase, toggleHighlight, copyLayout, save} = usePuzzleBoard(PUZZLE_ID);
    const pathAnalysis = usePathAnalysis(state);
    const towerCells = useMemo(() => towerCellsFor(state), [state]);
    const progress = evaluateProgress(state);
    const scoreSequenceStart = scoreSequenceStartFor(state);
    const board = {
        moves: state.moves,
        selectedMove: state.selectedMove,
        scores: state.displayScores.map(score => score?.toString()),
        towerCells,
        invalidMoves: progress.invalidMoves,
        highlightedCells: new Set([...state.highlightedCells, ...pathAnalysis.highlightedCells]),
    };

    return (
        <>
            <section className="puzzle-workspace" aria-label="Interactive puzzle grid">
                {!isLoading && (
                    <PuzzleBoard
                        board={board}
                        disabled={isSaving}
                        onSelectCell={selectCell}
                    />
                )}
                <PuzzleControls
                    state={{
                        selectedMove: state.selectedMove,
                        mode: state.mode,
                        disabled: isLoading || isSaving,
                        isSaving,
                    }}
                    onToggleErase={toggleErase}
                    onToggleHighlight={toggleHighlight}
                    onCopyLayout={copyLayout}
                    onSave={save}
                />
                <p className="puzzle-status" aria-live="polite">{status}</p>
            </section>
            {!isLoading && (
                <ScoreSequenceGenerator
                    start={scoreSequenceStart}
                    requiredScores={state.displayScores}
                    onCalculateAnswer={() => calculatePuzzleAnswer(state.moves, state.displayScores)}
                    onAnalyzeSequence={pathAnalysis.analyze}
                    onAddPaths={pathAnalysis.add}
                    storedPathCount={pathAnalysis.storedPathCount}
                    simulation={pathAnalysis.simulation}
                    onAnalyzeSimulation={pathAnalysis.summarizeSimulation}
                />
            )}
            <PuzzleInstructions/>
        </>
    );
}
