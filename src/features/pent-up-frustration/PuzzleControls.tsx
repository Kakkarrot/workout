import type {ReactNode} from 'react';
import type {PuzzleMode} from './puzzleState';

export type PuzzleControlsState = {
    selectedMove: number;
    mode: PuzzleMode;
    disabled: boolean;
    isSaving: boolean;
};

type PuzzleControlsProps = {
    state: PuzzleControlsState;
    onToggleErase: () => void;
    onToggleHighlight: () => void;
    onCopyLayout: () => Promise<void>;
    onSave: () => Promise<void>;
};

export function PuzzleControls({state, onToggleErase, onToggleHighlight, onCopyLayout, onSave}: PuzzleControlsProps) {
    return (
        <>
            <div className="puzzle-modes">
                <span className="active-move" aria-live="polite">Move: {state.selectedMove}</span>
                <ModeButton
                    label="Erase moves"
                    active={state.mode === 'erase'}
                    disabled={state.disabled}
                    onClick={onToggleErase}
                >
                    <TrashIcon/>
                </ModeButton>
                <IconButton
                    label={state.isSaving ? 'Saving board' : 'Save board'}
                    disabled={state.disabled}
                    onClick={() => void onSave()}
                >
                    <SaveIcon/>
                </IconButton>
                <ModeButton
                    label="Highlighter"
                    active={state.mode === 'highlight'}
                    disabled={state.disabled}
                    onClick={onToggleHighlight}
                >
                    <HighlighterIcon/>
                </ModeButton>
                <IconButton
                    label="Copy layout"
                    disabled={state.disabled}
                    onClick={() => void onCopyLayout()}
                >
                    <CopyIcon/>
                </IconButton>
            </div>
            <p className="puzzle-help">{helpText[state.mode]}</p>
        </>
    );
}

const helpText: Record<PuzzleMode, string> = {
    moves: 'Select a populated square to make it active, or an empty square to play the following move.',
    erase: 'Select a populated square to erase that move.',
    highlight: 'Select a square to toggle its highlight.',
};

type IconButtonProps = {
    label: string;
    disabled: boolean;
    active?: boolean;
    onClick: () => void;
    children: ReactNode;
};

function IconButton({label, disabled, active, onClick, children}: IconButtonProps) {
    return (
        <button
            className={`puzzle-mode puzzle-mode--icon${active ? ' puzzle-mode--active' : ''}`}
            type="button"
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

function ModeButton({active, ...props}: IconButtonProps & {active: boolean}) {
    return <IconButton {...props} active={active}/>;
}

function TrashIcon() {
    return <Icon path="M9 3h6l1 2h5v2H3V5h5l1-2Zm-3 6h12l-1 13H7L6 9Zm2.15 2 .7 9h6.3l.7-9h-7.7ZM10 12h2v6h-2v-6Zm3 0h2v6h-2v-6Z"/>;
}

function SaveIcon() {
    return <Icon path="M4 3h13.17L21 6.83V21H3V4a1 1 0 0 1 1-1Zm1 2v14h14V7.66L16.34 5H16v5H7V5H5Zm4 0v3h5V5H9Zm-1 8h8a1 1 0 0 1 1 1v5H7v-5a1 1 0 0 1 1-1Zm1 2v4h6v-4H9Z"/>;
}

function HighlighterIcon() {
    return <Icon path="m14.69 2.86 6.45 6.45a1 1 0 0 1 0 1.42l-8.48 8.48-7.87-7.87 8.48-8.48a1 1 0 0 1 1.42 0Zm-.71 2.12-6.36 6.36 5.04 5.04 6.36-6.36-5.04-5.04ZM3.38 12.75l7.87 7.87-.52.52a1 1 0 0 1-.71.3H3.56a1 1 0 0 1-1-1v-6.46a1 1 0 0 1 .29-.71l.53-.52ZM4.56 16v3.44H8l-3.44-3.45ZM2 22h20v2H2v-2Z"/>;
}

function CopyIcon() {
    return <Icon path="M8 2h11a3 3 0 0 1 3 3v11h-2V5a1 1 0 0 0-1-1H8V2ZM5 6h11a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Zm0 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H5Z"/>;
}

function Icon({path}: {path: string}) {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d={path}/>
        </svg>
    );
}
