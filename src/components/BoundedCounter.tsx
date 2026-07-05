type BoundedCounterProps = {
    value: number;
    min: number;
    max: number;
    label: string;
    disabled?: boolean;
    onChange: (value: number) => void;
};

export function BoundedCounter({value, min, max, label, disabled = false, onChange}: BoundedCounterProps) {
    return (
        <div className="bounded-counter" role="group" aria-label={label}>
            <button
                className="bounded-counter__button"
                type="button"
                aria-label={`Decrease ${label}`}
                disabled={disabled || value <= min}
                onClick={() => onChange(value - 1)}
            >
                −
            </button>
            <span className="bounded-counter__value" aria-live="polite">{value}</span>
            <button
                className="bounded-counter__button"
                type="button"
                aria-label={`Increase ${label}`}
                disabled={disabled || value >= max}
                onClick={() => onChange(value + 1)}
            >
                +
            </button>
        </div>
    );
}
