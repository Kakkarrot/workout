'use client';

import {CellEditor} from './CellEditor';
import {PuzzleBoard} from './PuzzleBoard';
import {usePuzzleEditor} from './usePuzzleEditor';

export function PuzzleGrid() {
    const editor = usePuzzleEditor();

    return (
        <section className="puzzle-workspace" aria-label="Interactive puzzle grid">
            <PuzzleBoard
                entries={editor.entries}
                selectedCell={editor.selectedCell}
                onSelectCell={editor.selectCell}
            />
            <p className="puzzle-help">Tap an empty square to enter a value or note.</p>
            <CellEditor editor={editor}/>
        </section>
    );
}
