import {describe, expect, it} from 'vitest';
import {assignSectionColors} from './sectionColoring';

describe('assignSectionColors', () => {
    it('colors an empty layout', () => {
        expect(assignSectionColors({}, [])).toEqual({});
    });

    it('assigns different colors to every adjacent region', () => {
        const layout = {
            1: [[0, 0]],
            2: [[1, 0], [1, 1]],
            3: [[0, 1]],
        } as const;
        const colors = assignSectionColors(layout, ['red', 'green', 'blue']);

        expect(colors[1]).not.toBe(colors[2]);
        expect(colors[1]).not.toBe(colors[3]);
        expect(colors[2]).not.toBe(colors[3]);
    });

    it('rejects a palette that cannot color the region graph', () => {
        const triangle = {
            1: [[0, 0]],
            2: [[1, 0], [1, 1]],
            3: [[0, 1]],
        } as const;
        expect(() => assignSectionColors(triangle, ['red', 'green'])).toThrow(
            'The section palette cannot color this puzzle layout',
        );
    });
});
