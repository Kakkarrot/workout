import {styled} from "@mui/material";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import React from "react";
import {useWindowDimensions} from "./WindowDimensions";

const StyledTextField = styled(TextField)(() => ({
    color: 'white',
    maxWidth: 0.4 * useWindowDimensions().width,
    minWidth: 0.4 * useWindowDimensions().width,
    '& label': {
        color: 'white',
    },
    "& label.Mui-focused": {
        color: 'white'
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'white',
        },
        '&:hover fieldset': {
            borderColor: 'white',
        },
        '&.Mui-focused fieldset': {
            borderColor: 'white',
        },
    },
}))

const StyledMenuItem = styled(MenuItem)(() => ({
    backgroundColor: "black !important",
    color: "white",
}))

export function getStyledTextField(name: string, defaultValue: string, workouts: string[], setField: (value:string) => void) {
    return <StyledTextField
        id="outlined-select-currency"
        select
        focused
        label={name}
        defaultValue={defaultValue}
        SelectProps={{
            MenuProps: {
                PaperProps: {
                    sx: {
                        backgroundColor: "black",
                        border: '0.1rem solid white',
                        "&& .Mui-selected": {
                            backgroundColor: "black",
                            "&: hover": {
                                backgroundColor: "black",
                            },
                        },
                    },
                },
            },
            sx: {
                '& .MuiSvgIcon-root': {
                    color: 'white',
                },
                fontWeight: "bolder",
                color: "white",
            }
        }}
    >
        {workouts.map((routine) => (
            <StyledMenuItem key={routine} value={routine} onClick={() => setField(routine)}>
                <b>{routine}</b>
            </StyledMenuItem>
        ))}
    </StyledTextField>;
}
