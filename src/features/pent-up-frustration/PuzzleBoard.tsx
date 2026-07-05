import {GRID_SIZE, PUZZLE_CELLS} from './puzzleDefinition';
import type {CellKey} from './types';

type PuzzleBoardProps = {
    movePath: readonly CellKey[];
    towerCells: ReadonlySet<CellKey>;
    onSelectCell: (key: CellKey) => void;
};

export function PuzzleBoard({movePath, towerCells, onSelectCell}: PuzzleBoardProps) {
    const moveByCell = new Map(movePath.map((key, move) => [key, move]));

    return (
        <div className="coordinate-grid">
            <div className="y-coordinates" aria-hidden="true">
                {axisValues().reverse().map(value => <span key={value}>{value}</span>)}
            </div>
            <div className="puzzle-grid" role="grid" aria-label={`${GRID_SIZE} by ${GRID_SIZE} puzzle grid`}>
                {PUZZLE_CELLS.map(cell => {
                    const move = moveByCell.get(cell.key);

                    return (
                        <button
                            className={cellClassName(
                                Boolean(cell.constant),
                                move === movePath.length - 1,
                                towerCells.has(cell.key),
                            )}
                            key={cell.key}
                            type="button"
                            role="gridcell"
                            aria-label={cellLabel(
                                cell.x,
                                cell.y,
                                cell.section,
                                cell.constant,
                                move,
                                towerCells.has(cell.key),
                            )}
                            onClick={() => onSelectCell(cell.key)}
                            style={{backgroundColor: cell.sectionColor}}
                        >
                            <CellNumber text={cell.constant}/>
                            {move !== undefined && <span className="puzzle-cell__move">{move}</span>}
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

function cellClassName(isConstant: boolean, isCurrentMove: boolean, hasTower: boolean) {
    return [
        'puzzle-cell',
        isConstant && 'puzzle-cell--prefilled',
        isCurrentMove && 'puzzle-cell--selected',
        hasTower && 'puzzle-cell--tower',
    ].filter(Boolean).join(' ');
}

function cellLabel(
    x: number,
    y: number,
    section: number,
    constant?: string,
    move?: number,
    hasTower = false,
) {
    const content = constant !== undefined ? `constant ${constant}` : 'empty';
    const moveDescription = move === undefined ? 'not visited' : `move ${move}`;
    const towerDescription = hasTower ? 'tower' : 'no tower';
    return `Coordinate ${x}, ${y}, ${content}, ${moveDescription}, ${towerDescription}, section ${section}`;
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
