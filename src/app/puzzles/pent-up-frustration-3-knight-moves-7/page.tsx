import Link from 'next/link';
import {PuzzleGrid} from '../../../features/pent-up-frustration/PuzzleGrid';
import {PuzzleInstructions} from '../../../features/pent-up-frustration/PuzzleInstructions';

export default function PentUpFrustrationPage() {
    return (
        <main className="page puzzle-page">
            <Link className="back-link" href="/puzzles">← All puzzles</Link>
            <h1>‘Pent-Up’ Frustration 3 / Knight Moves 7</h1>
            <PuzzleGrid/>
            <PuzzleInstructions/>
        </main>
    );
}
