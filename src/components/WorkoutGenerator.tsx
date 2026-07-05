'use client';

import {useState} from 'react';
import Link from 'next/link';
import {Button, MenuItem, Stack, TextField} from '@mui/material';
import {exercises, WorkoutGroup} from '../data/exercises';

const workoutGroups = Object.keys(exercises) as WorkoutGroup[];

function randomSelection(items: readonly string[], count: number) {
    return [...items].sort(() => 0.5 - Math.random()).slice(0, count);
}

export function WorkoutGenerator() {
    const [primary, setPrimary] = useState<WorkoutGroup>('arms');
    const [secondary, setSecondary] = useState<WorkoutGroup>('back');
    const [workout, setWorkout] = useState<string[]>([]);

    function generate() {
        const selected = new Set([
            ...randomSelection(exercises[primary], 8),
            ...randomSelection(exercises[secondary], 4),
        ]);
        setWorkout([...selected].sort(() => 0.5 - Math.random()));
    }

    return (
        <main className="workout-page">
            <Stack spacing={1} direction="column" style={{alignItems: 'center'}}>
                <Stack className="workout-controls" spacing={1} direction="column" style={{alignItems: 'center'}}>
                    <Button
                        className="generate-button"
                        variant="contained"
                        color="success"
                        component={Link}
                        href="/puzzles"
                    >
                        <strong>Mental Workout</strong>
                    </Button>
                    <Button className="generate-button" variant="contained" color="success" onClick={generate}>
                        <strong>Generate</strong>
                    </Button>
                    <Stack spacing={2} direction="row">
                        <WorkoutSelect label="Primary" value={primary} onChange={setPrimary}/>
                        <WorkoutSelect label="Secondary" value={secondary} onChange={setSecondary}/>
                    </Stack>
                </Stack>
                {workout.map(exercise => (
                    <div className="exercise" key={exercise}><strong>{exercise}</strong></div>
                ))}
            </Stack>
        </main>
    );
}

function WorkoutSelect({label, value, onChange}: {
    label: string;
    value: WorkoutGroup;
    onChange: (value: WorkoutGroup) => void;
}) {
    return (
        <TextField
            className="workout-select"
            select
            focused
            label={label}
            value={value}
            onChange={event => onChange(event.target.value as WorkoutGroup)}
            slotProps={{select: {MenuProps: {className: 'workout-menu'}}}}
        >
            {workoutGroups.map(group => (
                <MenuItem key={group} value={group}><strong>{group}</strong></MenuItem>
            ))}
        </TextField>
    );
}
