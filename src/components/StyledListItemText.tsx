import {ListItemText, styled} from "@mui/material";

const StyledListItemText = styled(ListItemText)(() => ({
    color: 'white',
    border: '0.15rem white solid',
    borderRadius: '0.5rem',
    minWidth: '95%',
    maxWidth: '95%',
    minHeight: '2rem',
    maxHeight: '2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
}))

export function getStyledListItemText(text: string) {
    return <StyledListItemText key={text}><b>{text}</b></StyledListItemText>
}
