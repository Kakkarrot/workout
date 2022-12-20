import React, {useEffect} from 'react';
import './App.css';
import {Button, Stack, styled} from '@mui/material';
import {getStyledTextField} from "./components/StyledTextField";




function App() {
    const workouts: string[] = [
        "arms", "back", "chest", "core", "legs",
    ];

    let [primary, setPrimary] = React.useState<string>(workouts.at(0)!);
    let [secondary, setSecondary] = React.useState<string>(workouts.at(1)!);

    let [arms, setArms] = React.useState<Set<String>>(new Set());
    let [back, setBack] = React.useState<Set<String>>(new Set());
    let [chest, setChest] = React.useState<Set<String>>(new Set());
    let [core, setCore] = React.useState<Set<String>>(new Set());
    let [legs, setLegs] = React.useState<Set<String>>(new Set());

    return (
        <div className="App">
            <Stack spacing={2} alignItems={"center"}>
                <span/>
                <Button variant="contained" color="success" style={{maxWidth: '150px', maxHeight: '50px', minWidth: '150px', minHeight: '50px'}}>
                    <b>Generate</b>
                </Button>
                <Stack spacing={2} direction="row">
                    {getStyledTextField("Primary", primary, workouts)}
                    {getStyledTextField("Secondary", secondary, workouts)}
                </Stack>
            </Stack>
        </div>
    );
}

export default App;
