'use client';

import {useEffect, useReducer, useState} from 'react';
import {createPuzzleState, puzzleReducer} from './puzzleState';
import {loadPuzzleState, savePuzzleState} from './puzzleStateApi';
import {storePuzzleState} from './puzzleStorage';
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
                const restoredState = await loadPuzzleState(stateApi, controller.signal);
                if (restoredState) dispatch({type: 'load', state: restoredState});
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
            await savePuzzleState(stateApi, state);
            setStatus('Board saved.');
        } catch (error) {
            setStatus(errorMessage(error, 'Could not save the board'));
        } finally {
            setIsSaving(false);
        }
    }

    async function copyLayout() {
        try {
            const layout = JSON.stringify(storePuzzleState(state), null, 2);
            await navigator.clipboard.writeText(layout);
            setStatus('Layout copied.');
        } catch (error) {
            setStatus(errorMessage(error, 'Could not copy the layout'));
        }
    }

    return {
        state,
        isLoading,
        isSaving,
        status,
        selectCell: (key: CellKey) => dispatch({type: 'selectCell', key}),
        toggleErase: () => dispatch({type: 'toggleErase'}),
        toggleHighlight: () => dispatch({type: 'toggleHighlight'}),
        copyLayout,
        save,
    };
}

function errorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}
