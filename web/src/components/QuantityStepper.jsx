export default function QuantityStepper({ value, onChange, min = 1, max = 99 }) {
  return (
    <div className="inline-flex items-center rounded-full border border-ink/15">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-9 w-9 items-center justify-center text-lg text-ink/60 hover:text-ink disabled:opacity-30"
        disabled={value <= min}
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-medium">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-9 w-9 items-center justify-center text-lg text-ink/60 hover:text-ink disabled:opacity-30"
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}
