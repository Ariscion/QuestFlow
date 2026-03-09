import React from "react";

type Props = { className?: string };

export function IconHome({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}

export function IconStore({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16l-1.2 12.5A1.5 1.5 0 0 1 17.3 21H6.7a1.5 1.5 0 0 1-1.5-1.5L4 7Z" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M8 10V6a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}

export function IconDownloads({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 3v10" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M5 20h14" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}

export function IconBell({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M6 9a6 6 0 0 1 12 0v5l2 2H4l2-2V9Z" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}

export function IconSettings({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M19.4 15a8.9 8.9 0 0 0 .1-2l2-1.2-2-3.4-2.3.7a8.8 8.8 0 0 0-1.7-1L14.9 5h-3.8l-.6 2.1a8.8 8.8 0 0 0-1.7 1L6.5 7.4l-2 3.4 2 1.2a8.9 8.9 0 0 0 .1 2l-2 1.2 2 3.4 2.3-.7a8.8 8.8 0 0 0 1.7 1l.6 2.1h3.8l.6-2.1a8.8 8.8 0 0 0 1.7-1l2.3.7 2-3.4-2-1.2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}
