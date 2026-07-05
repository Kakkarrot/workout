import {MAX_ENTRY_LENGTH, formatCoordinate} from './puzzleDefinition';
import type {EntryKind} from './types';
import type {PuzzleEditorModel} from './usePuzzleEditor';

const ENTRY_KINDS: readonly EntryKind[] = ['value', 'note'];

export function CellEditor({editor}: {editor: PuzzleEditorModel}) {
    if (!editor.selectedCell) return null;

    const selectedKind = editor.selectedEntry?.kind ?? 'value';

    return (
        <div className="cell-editor" aria-label="Cell editor">
            <div className="cell-editor__header">
                <strong>Cell {formatCoordinate(editor.selectedCell)}</strong>
                <button className="editor-done" type="button" onClick={editor.closeEditor}>Done</button>
            </div>
            <div className="entry-kind" role="group" aria-label="Entry type">
                {ENTRY_KINDS.map(kind => (
                    <button
                        className={`entry-kind__button${selectedKind === kind ? ' entry-kind__button--selected' : ''}`}
                        key={kind}
                        type="button"
                        aria-pressed={selectedKind === kind}
                        onClick={() => editor.setEntryKind(kind)}
                    >
                        {kind === 'value' ? 'Value' : 'Note'}
                    </button>
                ))}
            </div>
            <div className="number-entry">
                <input
                    ref={editor.inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={MAX_ENTRY_LENGTH}
                    enterKeyHint="done"
                    aria-label="Whole number"
                    placeholder="Enter a whole number"
                    value={editor.selectedEntry?.text ?? ''}
                    onChange={event => editor.setEntryText(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === 'Enter') editor.closeEditor();
                    }}
                />
                <button
                    className="editor-clear"
                    type="button"
                    onClick={editor.clearEntry}
                    disabled={!editor.selectedEntry?.text}
                >
                    Clear
                </button>
            </div>
        </div>
    );
}
