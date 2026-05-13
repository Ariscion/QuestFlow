import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from "react";

import { cn } from "../lib/cn";

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-800 bg-neutral-900/70 text-neutral-200 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-neutral-800 bg-neutral-900/85 text-neutral-200", className)} {...props} />;
}

export function Pill({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2 text-neutral-300", className)} {...props} />;
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "soft" | "ghost" };

export function Button({ className, variant = "soft", ...props }: BtnProps) {
  const base = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-5 py-2 text-center text-sm font-semibold leading-tight whitespace-normal break-words transition";
  const v =
    variant === "primary"
      ? `${base} border border-blue-500/40 bg-blue-600/80 text-white hover:bg-blue-500`
      : variant === "ghost"
        ? `${base} border border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-800`
        : `${base} border border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700`;
  return <button className={cn(v, className)} {...props} />;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/30"
      {...props}
    />
  );
}

export function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 overflow-hidden rounded-full border border-neutral-700 bg-neutral-800">
      <div className="h-full rounded-full bg-blue-500/80" style={{ width: `${v}%` }} />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl border border-neutral-800 bg-neutral-900/80", className)} />;
}

export { GameCover } from "./ui/GameCover";
