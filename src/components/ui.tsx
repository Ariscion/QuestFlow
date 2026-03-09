import React from "react";
import { cn } from "../lib/cn";

export function Panel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("qf-panel", className)} {...props} />;
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("qf-card", className)} {...props} />;
}

export function Pill({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("qf-pill", className)} {...props} />;
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "soft" | "ghost" };

export function Button({ className, variant = "soft", ...props }: BtnProps) {
  const v =
    variant === "primary" ? "qf-btn qf-btn-primary" :
    variant === "ghost" ? "qf-btn qf-btn-ghost" :
    "qf-btn qf-btn-soft";
  return <button className={cn(v, className)} {...props} />;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="qf-input" {...props} />;
}

export function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="qf-progress">
      <div style={{ width: v + "%" }} />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("qf-skel", className)} />;
}
