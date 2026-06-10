import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800/80 bg-slate-900 text-slate-200 shadow-xl",
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-slate-800/60 bg-slate-950/40 text-slate-200", className)} {...props} />;
}

export function Pill({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("inline-flex items-center rounded-full border border-slate-800 bg-slate-950 px-4 py-2 text-slate-300", className)} {...props} />;
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "soft" | "ghost" };

export function Button({ className, variant = "soft", ...props }: BtnProps) {
  const base = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-5 py-2 text-center text-sm font-semibold leading-tight whitespace-normal break-words transition active:scale-[0.98]";
  const v =
    variant === "primary"
      ? `${base} border border-blue-500/30 bg-blue-600 text-white hover:bg-blue-500 shadow-sm`
      : variant === "ghost"
        ? `${base} border border-slate-800 bg-transparent text-slate-300 hover:bg-slate-800`
        : `${base} border border-slate-800 bg-slate-800/80 text-slate-200 hover:bg-slate-700`;
  return <button className={cn(v, className)} {...props} />;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
      {...props}
    />
  );
}

export function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 overflow-hidden rounded-full border border-slate-800 bg-slate-950">
      <div className="h-full rounded-full bg-blue-600" style={{ width: `${v}%` }} />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl border border-slate-800/60 bg-slate-900/80", className)} />;
}


