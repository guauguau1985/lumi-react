type ProgressBarProps = {
  value: number;
  total?: number;
  className?: string;
  "aria-label"?: string;
};

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

export function ProgressBar({ value, total, className = "", ...ariaProps }: ProgressBarProps) {
  const hasTotal = typeof total === "number";
  const safeTotal = hasTotal && total! > 0 ? total! : hasTotal ? 1 : 100;

  const clampedValue = hasTotal ? clamp(value, 0, safeTotal) : clamp(value, 0, 100);
  const pct = hasTotal ? (clampedValue / safeTotal) * 100 : clampedValue;

  return (
    <div className={`w-full h-3 rounded-full bg-gray-100 overflow-hidden ${className}`}>
      <div
        className="h-full bg-lumi-green transition-[width]"
        style={{ width: `${pct}%` }}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={hasTotal ? clampedValue : pct}
        role="progressbar"
        {...ariaProps}
      >
        <span className="sr-only">
          {hasTotal
            ? `${Math.round(clampedValue)} de ${safeTotal}`
            : `${Math.round(pct)}% completado`}
        </span>
      </div>
    </div>
  );
}
