import {GRID_SIZE, PUZZLE_CELLS} from './puzzleDefinition';
import type {CellKey, PuzzleEntries} from './types';

type PuzzleBoardProps = {
    entries: PuzzleEntries;
    selectedCell: CellKey | null;
    onSelectCell: (key: CellKey) => void;
};

export function PuzzleBoard({entries, selectedCell, onSelectCell}: PuzzleBoardProps) {
    return (
        <div className="coordinate-grid">
            <div className="y-coordinates" aria-hidden="true">
                {axisValues().reverse().map(value => <span key={value}>{value}</span>)}
            </div>
            <div className="puzzle-grid" role="grid" aria-label={`${GRID_SIZE} by ${GRID_SIZE} puzzle grid`}>
                {PUZZLE_CELLS.map(cell => {
                    const entry = entries[cell.key];
                    const displayText = cell.constant ?? entry?.text;

                    return (
                        <button
                            className={cellClassName(Boolean(cell.constant), selectedCell === cell.key, entry?.kind)}
                            key={cell.key}
                            type="button"
                            role="gridcell"
                            aria-label={cellLabel(cell.x, cell.y, cell.section, cell.constant, entry)}
                            disabled={cell.constant !== undefined}
                            onClick={() => onSelectCell(cell.key)}
                            style={{backgroundColor: cell.sectionColor}}
                        >
                            <CellNumber text={displayText}/>
                        </button>
                    );
                })}
            </div>
            <div className="coordinate-corner" aria-hidden="true"/>
            <div className="x-coordinates" aria-hidden="true">
                {axisValues().map(value => <span key={value}>{value}</span>)}
            </div>
        </div>
    );
}

function axisValues() {
    return Array.from({length: GRID_SIZE}, (_, index) => index);
}

function cellClassName(isConstant: boolean, isSelected: boolean, entryKind?: 'value' | 'note') {
    return [
        'puzzle-cell',
        isConstant && 'puzzle-cell--prefilled',
        isSelected && 'puzzle-cell--selected',
        entryKind === 'note' && 'puzzle-cell--note',
    ].filter(Boolean).join(' ');
}

function cellLabel(
    x: number,
    y: number,
    section: number,
    constant?: string,
    entry?: PuzzleEntries[CellKey],
) {
    const content = constant !== undefined
        ? `constant ${constant}`
        : entry
            ? `${entry.kind} ${entry.text}`
            : 'empty';
    return `Coordinate ${x}, ${y}, ${content}, section ${section}`;
}

function CellNumber({text}: {text?: string}) {
    if (!text) return null;
    if (text.length <= 4) return <span>{text}</span>;

    return (
        <span className="cell-number cell-number--wrapped">
            <span>{text.slice(0, 4)}</span>
            <span>{text.slice(4)}</span>
        </span>
    );
}
