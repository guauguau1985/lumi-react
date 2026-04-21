import React from "react";

export function Card({
  className = "",
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`rounded-2xl border bg-[var(--color-card)] border-[var(--color-card-border)] ${className}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {children}
    </div>
  );
}

export function CardContent({
  className = "",
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function CardHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="p-5 border-b border-[var(--color-divider)]">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        {title}
      </h3>
      {subtitle && (
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {subtitle}
        </p>
      )}
    </div>
  );
}