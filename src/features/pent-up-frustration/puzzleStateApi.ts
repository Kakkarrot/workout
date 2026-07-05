import {restorePuzzleState, storePuzzleState} from './puzzleStorage';
import type {PuzzleState} from './puzzleState';

type Fetcher = typeof fetch;

export async function loadPuzzleState(url: string, signal: AbortSignal, fetcher: Fetcher = fetch) {
    const response = await fetcher(url, {signal});
    if (!response.ok) throw new Error('Could not load the saved board');
    const savedState: unknown = await response.json();
    if (savedState === null) return null;
    const restored = restorePuzzleState(savedState);
    if (!restored) throw new Error('The saved board is invalid');
    return restored;
}

export async function savePuzzleState(url: string, state: PuzzleState, fetcher: Fetcher = fetch) {
    const response = await fetcher(url, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(storePuzzleState(state)),
    });
    if (!response.ok) throw new Error('Could not save the board');
}
