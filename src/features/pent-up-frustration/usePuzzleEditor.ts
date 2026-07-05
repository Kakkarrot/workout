'use client';

import {useEffect, useRef, useState} from 'react';
import {MAX_ENTRY_LENGTH} from './puzzleDefinition';
import type {CellKey, EntryKind, PuzzleEntries} from './types';

export type PuzzleEditorModel = ReturnType<typeof usePuzzleEditor>;

export function usePuzzleEditor() {
    const [entries, setEntries] = useState<PuzzleEntries>({});
    const [selectedCell, setSelectedCell] = useState<CellKey | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectedCell) inputRef.current?.focus();
    }, [selectedCell]);

    const selectedEntry = selectedCell ? entries[selectedCell] : undefined;

    function updateSelectedEntry(kind: EntryKind, text: string) {
        if (!selectedCell) return;
        setEntries(current => ({...current, [selectedCell]: {kind, text}}));
    }

    function setEntryKind(kind: EntryKind) {
        updateSelectedEntry(kind, selectedEntry?.text ?? '');
    }

    function setEntryText(value: string) {
        const text = value.replace(/\D/g, '').slice(0, MAX_ENTRY_LENGTH);
        updateSelectedEntry(selectedEntry?.kind ?? 'value', text);
    }

    function clearEntry() {
        if (!selectedCell) return;
        setEntries(current => {
            const next = {...current};
            delete next[selectedCell];
            return next;
        });
        inputRef.current?.focus();
    }

    return {
        entries,
        selectedCell,
        selectedEntry,
        inputRef,
        selectCell: setSelectedCell,
        closeEditor: () => setSelectedCell(null),
        setEntryKind,
        setEntryText,
        clearEntry,
    };
}
