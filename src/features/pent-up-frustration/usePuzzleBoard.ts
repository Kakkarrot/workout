'use client';

import {useEffect, useReducer, useState} from 'react';
import {createPuzzleState, puzzleReducer} from './puzzleState';
import {restorePuzzleState, storePuzzleState} from './puzzleStorage';
import type {CellKey} from './types';

export function usePuzzleBoard(puzzleId: string) {
    const [state, dispatch] = useReducer(puzzleReducer, undefined, createPuzzleState);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState('Loading saved board…');
    const stateApi = `/api/puzzles/${encodeURIComponent(puzzleId)}/state`;

    useEffect(() => {
        const controller = new AbortController();

        async function loadBoard() {
            try {
                const response = await fetch(stateApi, {signal: controller.signal});
                if (!response.ok) throw new Error('Could not load the saved board');
                const savedState: unknown = await response.json();
                if (savedState !== null) {
                    const restoredState = restorePuzzleState(savedState);
                    if (!restoredState) throw new Error('The saved board is invalid');
                    dispatch({type: 'load', state: restoredState});
                }
                setStatus('');
            } catch (error) {
                if (!controller.signal.aborted) setStatus(errorMessage(error, 'Could not load the saved board'));
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        }

        void loadBoard();
        return () => controller.abort();
    }, [stateApi]);

    async function save() {
        setIsSaving(true);
        setStatus('Saving…');
        try {
            const response = await fetch(stateApi, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(storePuzzleState(state)),
            });
            if (!response.ok) throw new Error('Could not save the board');
            setStatus('Board saved.');
        } catch (error) {
            setStatus(errorMessage(error, 'Could not save the board'));
        } finally {
            setIsSaving(false);
        }
    }

    return {
        state,
        isLoading,
        isSaving,
        status,
        selectCell: (key: CellKey) => dispatch({type: 'selectCell', key}),
        toggleMultiReset: () => dispatch({type: 'toggleMultiReset'}),
        save,
    };
}

function errorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}
