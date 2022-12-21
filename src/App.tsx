import React, {useEffect} from 'react';
import './App.css';
import {Button, Stack} from '@mui/material';
import {getStyledTextField} from "./components/StyledTextField";
import {getStyledListItemText} from "./components/StyledListItemText";
import {useWindowDimensions} from "./components/WindowDimensions";

function App() {
    const workouts: string[] = [
        "arms", "back", "chest", "core", "legs",
    ];
    const randomSort = () => 0.5 - Math.random();
    let [primary, setPrimary] = React.useState<string>(workouts.at(0)!);
    let [secondary, setSecondary] = React.useState<string>(workouts.at(1)!);
    let [primaryExercises, setPrimaryExercises] = React.useState<Set<string>>(new Set())
    let [secondaryExercises, setSecondaryExercises] = React.useState<Set<string>>(new Set())
    let [workout, setWorkout] = React.useState<Set<string>>(new Set());

    useEffect(() => {
        let newWorkout = new Set(workout)
        if (primaryExercises.size !== 0 && secondaryExercises.size !== 0) {
            primaryExercises?.forEach(x => newWorkout.add(x))
            secondaryExercises?.forEach(x => newWorkout.add(x))
        }
        setWorkout(new Set(Array.from(newWorkout).sort(randomSort)))
    }, [primaryExercises, secondaryExercises])

    function fetchExercisesFromFile(file: string, setter: (items: Set<string>) => void, count: number) {
        fetch(require(`./resources/${file}.txt`))
            .then(raw => raw.text())
            .then(text => setter(new Set(text.split("\n").filter(x => x.length > 0).sort(randomSort).slice(0, count))));
    }

    function generate(): void {
        const primaryCount = 8;
        const secondaryCount = 4;
        setWorkout(new Set())
        fetchExercisesFromFile(primary, setPrimaryExercises, primaryCount);
        fetchExercisesFromFile(secondary, setSecondaryExercises, secondaryCount);
    }

    function displayWorkoutText() {
        return <>
            {Array.from(workout!).map((exercise) => (
                getStyledListItemText(exercise)
            ))}
        </>;
    }

    return (
        <div className="App">
            <Stack spacing={1} direction={"column"} alignItems={"center"}>
                <Stack spacing={1} direction={"column"} alignItems={"center"}
                       style={{position: 'sticky', top: 0, backgroundColor: 'black', width: (0.9 * useWindowDimensions().width)}}>
                    <span/><span/><span/><span/>
                    <Button variant="contained" color="success" onClick={generate}
                            style={{maxWidth: '100%', minWidth: '100%', maxHeight: '100%', minHeight: '100%'}}>
                        <b>Generate</b>
                    </Button>
                    <span/>
                    <Stack spacing={2} direction="row">
                        {getStyledTextField("Primary", primary, workouts, setPrimary)}
                        {getStyledTextField("Secondary", secondary, workouts, setSecondary)}
                    </Stack>
                    <span/>
                </Stack>
                {displayWorkoutText()}
                <span/><span/><span/><span/>
            </Stack>
        </div>
    );
}

export default App;
