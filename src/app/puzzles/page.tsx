import Link from 'next/link';

export default function PuzzlesPage() {
    return (
        <main className="page">
            <Link className="back-link" href="/">← Workout generator</Link>
            <h1>Puzzles</h1>
            <ul className="puzzle-list">
                <li>
                    <Link href="/puzzles/pent-up-frustration-3-knight-moves-7">
                        ‘Pent-Up’ Frustration 3 / Knight Moves 7
                    </Link>
                </li>
            </ul>
        </main>
    );
}
