import styles from './PuzzleInstructions.module.css';

export function PuzzleInstructions() {
    return (
        <section className={styles.instructions} aria-labelledby="puzzle-instructions-title">
            <h2 id="puzzle-instructions-title">How to play</h2>
            <p>
                Reconstruct the knight’s path from the bottom-left square. The 13 colored regions each
                contain exactly one tower, and the path must visit every tower without landing on any
                square twice. Printed numbers are fixed score clues that your path must match.
            </p>
            <ul>
                <li>
                    A tower is one cube high. On the board, a normal knight move <strong>(1 across, 2 up)</strong>{' '}
                    stays at the same height. A move <strong>2 squares straight</strong> must go between a tower
                    and a non-tower square.
                </li>
                <li>
                    On move <strong>N</strong>: add N when staying at the same height, multiply by N when moving
                    up, or divide by N when moving down. Division must produce a whole number.
                </li>
                <li>
                    Choose a move number and then select its destination. You may enter disconnected parts
                    of the path; they are fully verified when the gaps connecting them are filled.
                </li>
            </ul>
            <p>
                To finish, fill in the missing path scores. For every unvisited square, add the scores in
                its orthogonally adjacent visited squares; the puzzle answer is the sum of those results.
            </p>
            <p className={styles.controls}>
                Before moving, select the starting square to toggle a tower there. Use <strong>−</strong> and{' '}
                <strong>+</strong> to change the move number. Selecting a populated square changes the counter
                to that move. Use <strong>Erase</strong> to remove only the selected square’s move.
            </p>
        </section>
    );
}
