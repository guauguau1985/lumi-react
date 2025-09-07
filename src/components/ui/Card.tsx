import React from "react";

export function Card({
  className = "",
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`rounded-2xl bg-white shadow-sm border border-gray-100 ${className}`}>
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
    <div className="p-5 border-b border-gray-100">
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
