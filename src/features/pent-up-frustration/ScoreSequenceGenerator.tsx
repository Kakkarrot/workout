'use client';

import {FormEvent, useEffect, useState} from 'react';
import {BoundedCounter} from '../../components/BoundedCounter';
import {
    MAX_SCORE_STEPS,
    generateScoresForward,
    type ScoreSequence,
    type ScoreSequenceStart,
} from './scoreSequences';
import type {PathAnalysis} from './pathAnalysis';
import styles from './ScoreSequenceGenerator.module.css';

type ScoreSequenceGeneratorProps = {
    start: ScoreSequenceStart | null;
    onAnalyzeSequence: (sequence: ScoreSequence) => PathAnalysis;
    onAddPaths: (paths: PathAnalysis['paths']) => void;
    storedPathCount: number;
};

export function ScoreSequenceGenerator({
    start,
    onAnalyzeSequence,
    onAddPaths,
    storedPathCount,
}: ScoreSequenceGeneratorProps) {
    const score = start?.score ?? BigInt(0);
    const move = start?.move ?? 1;
    const height = start?.height ?? 0;
    const [steps, setSteps] = useState(1);
    const [results, setResults] = useState<ScoreSequence[] | null>(null);
    const [analysis, setAnalysis] = useState<{key: string; result: PathAnalysis} | null>(null);
    const [addedKeys, setAddedKeys] = useState<ReadonlySet<string>>(new Set());

    useEffect(() => {
        setResults(null);
        setAnalysis(null);
        setAddedKeys(new Set());
    }, [score, move, height]);

    function generate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!start) return;
        setResults(generateScoresForward(score, move, height, steps));
        setAnalysis(null);
        setAddedKeys(new Set());
    }

    function addPaths(key: string, result: PathAnalysis) {
        onAddPaths(result.paths);
        setAddedKeys(current => new Set(current).add(key));
    }

    return (
        <section className={styles.generator} aria-labelledby="score-generator-title">
            <h2 id="score-generator-title">Generate possible scores</h2>
            {start
                ? <p className={styles.startingValues}>
                    Starting at score {score.toString()}, move {move}, height {height}.
                </p>
                : <p className={styles.startingValues}>Selected move score unavailable.</p>}
            <form className={styles.form} onSubmit={generate}>
                <span>Steps</span>
                <BoundedCounter
                    value={steps}
                    min={1}
                    max={MAX_SCORE_STEPS}
                    label="steps"
                    onChange={setSteps}
                />
                <button className={styles.generateButton} type="submit" disabled={!start}>
                    Generate scores
                </button>
            </form>
            {results !== null && (
                <div className={styles.results} aria-live="polite">
                    <p>{results.length} possible {results.length === 1 ? 'sequence' : 'sequences'}</p>
                    <ol>
                        {results.map((sequence, index) => {
                            const key = `${sequence.join('-')}-${index}`;
                            return (
                                <li key={key}>
                                    <span>{sequence.join(' → ')}</span>
                                    <button
                                        className={styles.analyzeButton}
                                        type="button"
                                        onClick={() => setAnalysis({key, result: onAnalyzeSequence(sequence)})}
                                    >
                                        Analyze path
                                    </button>
                                    <button
                                        className={styles.addButton}
                                        type="button"
                                        disabled={analysis?.key !== key || analysis.result.paths.length === 0 || addedKeys.has(key)}
                                        onClick={() => analysis?.key === key && addPaths(key, analysis.result)}
                                    >
                                        {addedKeys.has(key) ? 'Added' : 'Add'}
                                    </button>
                                    {analysis?.key === key && (
                                        <span className={styles.analysis}>
                                            {analysis.result.paths.length} valid paths;{' '}
                                            {analysis.result.sharedCells.size} shared squares including anchors
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                    <p className={styles.storedCount}>{storedPathCount} stored paths in memory</p>
                </div>
            )}
        </section>
    );
}
