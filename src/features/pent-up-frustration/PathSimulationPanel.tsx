'use client';

import {useEffect, useState} from 'react';
import type {PathSimulation, PathSimulationSummary} from './pathSimulation';
import styles from './ScoreSequenceGenerator.module.css';

type PathSimulationPanelProps = {
    simulation: PathSimulation;
    onAnalyze: () => PathSimulationSummary;
};

export function PathSimulationPanel({simulation, onAnalyze}: PathSimulationPanelProps) {
    const [summary, setSummary] = useState<PathSimulationSummary | null>(null);

    useEffect(() => setSummary(null), [simulation]);

    return (
        <div className={styles.simulation}>
            <p className={styles.simulationCount}>
                {simulation.validPathCount.toString()} valid paths from move{' '}
                {simulation.startMove} to {simulation.endMove}
            </p>
            <button
                className={styles.analyzeSimulationButton}
                type="button"
                onClick={() => setSummary(onAnalyze())}
            >
                Analyze common squares
            </button>
            {summary && (
                <div className={styles.simulationSummary} aria-live="polite">
                    <p>Always towers: {formatCells(summary.alwaysTowerCells)}</p>
                    <p>Always the same number: {formatFixedValues(summary.fixedValuesByCell)}</p>
                </div>
            )}
            {simulation.paths.length > 0 && (
                <details>
                    <summary>Show path contents</summary>
                    <ol className={styles.simulatedPaths}>
                        {simulation.paths.map((path, pathIndex) => (
                            <li key={pathIndex}>
                                {path.map(pathMove => (
                                    <span key={pathMove.move}>
                                        <strong>{pathMove.move}</strong>: {pathMove.cell}
                                        {' = '}{pathMove.value}
                                        {pathMove.isTower ? ' (tower)' : ''}
                                    </span>
                                ))}
                            </li>
                        ))}
                    </ol>
                </details>
            )}
        </div>
    );
}

function formatCells(cells: ReadonlySet<string>) {
    return cells.size > 0 ? [...cells].join(', ') : 'none';
}

function formatFixedValues(values: ReadonlyMap<string, string>) {
    return values.size > 0
        ? [...values].map(([cell, value]) => `${cell} = ${value}`).join(', ')
        : 'none';
}
