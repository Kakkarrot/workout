import React, {useEffect} from 'react';
import './App.css';
import {Button, Stack} from '@mui/material';
import {getStyledTextField} from "./components/StyledTextField";

function App() {
    const workouts: string[] = [
        "arms", "back", "chest", "core", "legs",
    ];

    let [primary, setPrimary] = React.useState<string>(workouts.at(0)!);
    let [secondary, setSecondary] = React.useState<string>(workouts.at(1)!);

    let [primaryExercises, setPrimaryExercises] = React.useState<Set<string>>()
    let [secondaryExercises, setSecondaryExercises] = React.useState<Set<string>>()

    let [arms, setArms] = React.useState<Set<string>>(new Set());
    let [back, setBack] = React.useState<Set<string>>(new Set());
    let [chest, setChest] = React.useState<Set<string>>(new Set());
    let [core, setCore] = React.useState<Set<string>>(new Set());
    let [legs, setLegs] = React.useState<Set<string>>(new Set());

    let [workout, setWorkout] = React.useState<Set<string>>(new Set());

    function generate(): void {
        fetch(require(`./resources/${primary}.txt`))
            .then(raw => raw.text())
            .then(text => {
                const exercises: string[] = text.split("\n")
                let set: Set<string> = new Set(exercises)
                let sorted = Array.from(set).sort();
                sorted.forEach(exercise => console.log(exercise))
            });
    }

    return (
        <div className="App">
            <Stack spacing={2} alignItems={"center"}>
                <span/>
                <Button variant="contained" color="success" onClick={generate}
                        style={{maxWidth: '150px', maxHeight: '50px', minWidth: '150px', minHeight: '50px'}}>
                    <b>Generate</b>
                </Button>
                <Stack spacing={2} direction="row">
                    {getStyledTextField("Primary", primary, workouts, setPrimary)}
                    {getStyledTextField("Secondary", secondary, workouts, setSecondary)}
                </Stack>
            </Stack>
        </div>
    );
}

export default App;
