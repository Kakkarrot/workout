'use client';

import {FormEvent, useEffect, useState} from 'react';
import {BoundedCounter} from '../../components/BoundedCounter';
import {
    MAX_SCORE_STEPS,
    generateScoresForward,
    type ScoreSequence,
    type ScoreSequenceStart,
} from './scoreSequences';
import styles from './ScoreSequenceGenerator.module.css';

type ScoreSequenceGeneratorProps = {
    start: ScoreSequenceStart | null;
};

export function ScoreSequenceGenerator({start}: ScoreSequenceGeneratorProps) {
    const score = start?.score ?? BigInt(0);
    const move = start?.move ?? 1;
    const height = start?.height ?? 0;
    const [steps, setSteps] = useState(1);
    const [results, setResults] = useState<ScoreSequence[] | null>(null);

    useEffect(() => setResults(null), [score, move, height]);

    function generate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!start) return;
        setResults(generateScoresForward(score, move, height, steps));
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
                        {results.map((sequence, index) => (
                            <li key={`${sequence.join('-')}-${index}`}>{sequence.join(' → ')}</li>
                        ))}
                    </ol>
                </div>
            )}
        </section>
    );
}
