export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full bg-lumi-green transition-[width]"
        style={{ width: `${pct}%` }}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        role="progressbar"
      />
    </div>
  );
}
