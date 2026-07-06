'use client';

import {useEffect, useState} from 'react';
import {analyzeSequencePaths, type AnalyzedPath} from './pathAnalysis';
import {addPathSegment, storedPathCount, type StoredPathSegment} from './pathMemory';
import type {PuzzleState} from './puzzleState';
import type {ScoreSequence} from './scoreSequences';
import type {CellKey} from './types';

export function usePathAnalysis(state: PuzzleState) {
    const [highlightedCells, setHighlightedCells] = useState<ReadonlySet<CellKey>>(new Set());
    const [storedSegments, setStoredSegments] = useState<readonly StoredPathSegment[]>([]);

    useEffect(() => setHighlightedCells(new Set()), [state.moves, state.selectedMove]);

    function analyze(sequence: ScoreSequence) {
        const analysis = analyzeSequencePaths({...state, sequence});
        const occupied = new Set(state.moves.filter((cell): cell is CellKey => Boolean(cell)));
        setHighlightedCells(new Set([...analysis.sharedCells].filter(cell => !occupied.has(cell))));
        return analysis;
    }

    function add(paths: readonly AnalyzedPath[]) {
        setStoredSegments(current => addPathSegment(current, paths));
    }

    return {
        highlightedCells,
        storedSegments,
        storedPathCount: storedPathCount(storedSegments),
        analyze,
        add,
    };
}
