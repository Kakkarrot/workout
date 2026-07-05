'use client';

import {useState} from 'react';
import {PuzzleBoard} from './PuzzleBoard';
import {PUZZLE_CELLS} from './puzzleDefinition';
import type {CellKey} from './types';

const MAX_MARKED_SQUARES = 64;
const STARTING_CELL: CellKey = '0,0';
const sectionByCell = new Map(PUZZLE_CELLS.map(cell => [cell.key, cell.section]));

export function PuzzleGrid() {
    const [movePath, setMovePath] = useState<readonly CellKey[]>([STARTING_CELL]);
    const [towerMode, setTowerMode] = useState(false);
    const [multiResetMode, setMultiResetMode] = useState(false);
    const [towerBySection, setTowerBySection] = useState<ReadonlyMap<number, CellKey>>(new Map());

    function selectCell(key: CellKey) {
        if (towerMode) {
            toggleTower(key);
            return;
        }

        setMovePath(current => {
            const existingMove = current.indexOf(key);

            if (existingMove >= 0) {
                const isSingleStepReset = existingMove === current.length - 2;
                if (!multiResetMode && !isSingleStepReset) return current;
                return current.slice(0, existingMove + 1);
            }
            if (current.length >= MAX_MARKED_SQUARES) return current;
            return [...current, key];
        });
    }

    function toggleTower(key: CellKey) {
        const section = sectionByCell.get(key);
        if (section === undefined) return;

        setTowerBySection(current => {
            const next = new Map(current);
            if (next.get(section) === key) next.delete(section);
            else next.set(section, key);
            return next;
        });
    }

    return (
        <section className="puzzle-workspace" aria-label="Interactive puzzle grid">
            <PuzzleBoard
                movePath={movePath}
                towerCells={new Set(towerBySection.values())}
                onSelectCell={selectCell}
            />
            <div className="puzzle-modes">
                <button
                    className={`puzzle-mode${towerMode ? ' puzzle-mode--active' : ''}`}
                    type="button"
                    aria-pressed={towerMode}
                    onClick={() => {
                        setTowerMode(current => !current);
                        setMultiResetMode(false);
                    }}
                >
                    Place towers
                </button>
                <button
                    className={`puzzle-mode${multiResetMode ? ' puzzle-mode--active' : ''}`}
                    type="button"
                    aria-pressed={multiResetMode}
                    onClick={() => {
                        setMultiResetMode(current => !current);
                        setTowerMode(false);
                    }}
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
