import Link from 'next/link';

export default function PuzzlesPage() {
    return (
        <main className="page">
            <Link className="back-link" href="/">← Workout generator</Link>
            <h1>Puzzles</h1>
            <ul className="puzzle-list">
                <li>
                    <Link href="/puzzles/pent-up-frustration-3-knight-moves-7">
                        2026 July
                    </Link>
                </li>
            </ul>
        </main>
    );
}
