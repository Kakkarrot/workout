'use client';

import {FormEvent, useEffect, useState} from 'react';
import {
    generateScoresForward,
    type ScoreSequence,
    type ScoreSequenceStart,
} from './scoreSequences';
import styles from './ScoreSequenceGenerator.module.css';

type ScoreSequenceGeneratorProps = {
    start: ScoreSequenceStart;
};

export function ScoreSequenceGenerator({start}: ScoreSequenceGeneratorProps) {
    const {score, move, height} = start;
    const [stepsInput, setStepsInput] = useState('1');
    const [results, setResults] = useState<ScoreSequence[] | null>(null);
    const steps = Number(stepsInput);
    const hasValidSteps = stepsInput.trim() !== ''
        && Number.isInteger(steps)
        && steps >= 1
        && steps <= 12;

    useEffect(() => setResults(null), [score, move, height]);

    function generate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!hasValidSteps) return;
        setResults(generateScoresForward(score, move, height, steps));
    }

    return (
        <section className={styles.generator} aria-labelledby="score-generator-title">
            <h2 id="score-generator-title">Generate possible scores</h2>
            <p className={styles.startingValues}>
                Starting at score {score.toString()}, move {move}, height {height}.
            </p>
            <form className={styles.form} onSubmit={generate}>
                <label htmlFor="score-generator-steps">Steps</label>
                <input
                    id="score-generator-steps"
                    type="number"
                    min="1"
                    max="12"
                    step="1"
                    required
                    value={stepsInput}
                    onChange={event => setStepsInput(event.currentTarget.value)}
                />
                <button type="submit" disabled={!hasValidSteps}>
                    Generate scores
                </button>
            </form>
            {results !== null && (
                <div className={styles.results} aria-live="polite">
                    <p>{results.length} possible {results.length === 1 ? 'sequence' : 'sequences'}</p>
                    <ol>
                        {results.map((sequence, index) => (
                            <li key={`${sequence.join('-')}-${index}`}>{sequence.join(' → ')}</li>
                        ))}
                    </ol>
                </div>
            )}
        </section>
    );
}
