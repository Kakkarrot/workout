import {describe, expect, it, vi} from 'vitest';
import {createPuzzleState} from './puzzleState';
import {loadPuzzleState, savePuzzleState} from './puzzleStateApi';

function response(ok: boolean, body: unknown = null) {
    return {ok, json: async () => body} as Response;
}

describe('puzzle state API client', () => {
    it('loads and restores saved state', async () => {
        const fetcher = vi.fn(async () => response(true, {
            version: 2,
            moves: ['0,0', '2,1'],
            startingCellIsTower: false,
        })) as unknown as typeof fetch;
        const controller = new AbortController();

        await expect(loadPuzzleState('/state', controller.signal, fetcher))
            .resolves.toMatchObject({moves: ['0,0', '2,1']});
        expect(fetcher).toHaveBeenCalledWith('/state', {signal: controller.signal});
    });

    it('loads an empty board and rejects invalid responses', async () => {
        const controller = new AbortController();
        const empty = vi.fn(async () => response(true)) as unknown as typeof fetch;
        const invalid = vi.fn(async () => response(true, {invalid: true})) as unknown as typeof fetch;
        const failed = vi.fn(async () => response(false)) as unknown as typeof fetch;

        await expect(loadPuzzleState('/state', controller.signal, empty)).resolves.toBeNull();
        await expect(loadPuzzleState('/state', controller.signal, invalid)).rejects.toThrow('saved board is invalid');
        await expect(loadPuzzleState('/state', controller.signal, failed)).rejects.toThrow('Could not load');
    });

    it('saves minimal state with the expected request', async () => {
        const fetcher = vi.fn(async () => response(true)) as unknown as typeof fetch;
        await savePuzzleState('/state', createPuzzleState(), fetcher);

        expect(fetcher).toHaveBeenCalledWith('/state', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({version: 2, moves: ['0,0'], startingCellIsTower: false}),
        });
    });

    it('reports save failures', async () => {
        const fetcher = vi.fn(async () => response(false)) as unknown as typeof fetch;
        await expect(savePuzzleState('/state', createPuzzleState(), fetcher)).rejects.toThrow('Could not save');
    });
});
