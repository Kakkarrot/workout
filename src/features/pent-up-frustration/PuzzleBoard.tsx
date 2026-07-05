import {GRID_SIZE, PUZZLE_CELLS} from './puzzleDefinition';
import type {CellKey} from './types';

type PuzzleBoardProps = {
    moves: readonly (CellKey | null)[];
    selectedMove: number;
    scores: readonly (string | undefined)[];
    towerCells: ReadonlySet<CellKey>;
    invalidMoves: ReadonlySet<number>;
    disabled: boolean;
    onSelectCell: (key: CellKey) => void;
};

export function PuzzleBoard({moves, selectedMove, scores, towerCells, invalidMoves, disabled, onSelectCell}: PuzzleBoardProps) {
    const moveByCell = new Map(moves.flatMap((key, move) => key ? [[key, move] as const] : []));

    return (
        <div className="coordinate-grid">
            <div className="y-coordinates" aria-hidden="true">
                {axisValues().reverse().map(value => <span key={value}>{value}</span>)}
            </div>
            <div className="puzzle-grid" role="grid" aria-label={`${GRID_SIZE} by ${GRID_SIZE} puzzle grid`}>
                {PUZZLE_CELLS.map(cell => {
                    const move = moveByCell.get(cell.key);
                    const score = move === undefined ? undefined : scores[move];
                    const displayedNumber = score ?? cell.constant ?? move?.toString();

                    return (
                        <button
                            className={cellClassName(
                                Boolean(cell.constant),
                                move === selectedMove,
                                towerCells.has(cell.key),
                                move !== undefined && invalidMoves.has(move),
                            )}
                            key={cell.key}
                            type="button"
                            disabled={disabled}
                            role="gridcell"
                            aria-label={cellLabel(
                                cell.x,
                                cell.y,
                                cell.section,
                                cell.constant,
                                move,
                                score,
                                towerCells.has(cell.key),
                            )}
                            onClick={() => onSelectCell(cell.key)}
                            style={{backgroundColor: cell.sectionColor}}
                        >
                            <CellNumber text={displayedNumber}/>
                            {move !== undefined && (score !== undefined || cell.constant !== undefined)
                                && <span className="puzzle-cell__move">{move}</span>}
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

function cellClassName(isConstant: boolean, isCurrentMove: boolean, hasTower: boolean, isInvalid: boolean) {
    return [
        'puzzle-cell',
        isConstant && 'puzzle-cell--prefilled',
        isCurrentMove && 'puzzle-cell--selected',
        hasTower && 'puzzle-cell--tower',
        isInvalid && 'puzzle-cell--invalid',
    ].filter(Boolean).join(' ');
}

function cellLabel(
    x: number,
    y: number,
    section: number,
    constant?: string,
    move?: number,
    score?: string,
    hasTower = false,
) {
    const content = constant !== undefined ? `constant ${constant}` : 'empty';
    const moveDescription = move === undefined ? 'not visited' : `move ${move}`;
    const scoreDescription = score === undefined ? '' : `, score ${score}`;
    const towerDescription = hasTower ? 'tower' : 'no tower';
    return `Coordinate ${x}, ${y}, ${content}, ${moveDescription}${scoreDescription}, ${towerDescription}, section ${section}`;
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
