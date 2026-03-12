
type Props = { className?: string };

export function IconHome({ className }: Props) {
    return (
        <svg className={`shrink-0 ${className || ""}`} viewBox="0 0 24 24" fill="none">
            <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        </svg>
    );
}

export function IconStore({ className }: Props) {
    return (
        <svg className={`shrink-0 ${className || ""}`} viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16l-1.2 12.5A1.5 1.5 0 0 1 17.3 21H6.7a1.5 1.5 0 0 1-1.5-1.5L4 7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            <path d="M8 10V6a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
    );
}

// Перенесли иконку Библиотеки сюда для чистоты
export function IconLibrary({ className }: Props) {
    return (
        <svg className={`shrink-0 ${className || ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zm10 0a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V6zM4 16a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2zm10 0a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2z" />
        </svg>
    );
}

export function IconDownloads({ className }: Props) {
    return (
        <svg className={`shrink-0 ${className || ""}`} viewBox="0 0 24 24" fill="none">
            <path d="M12 3v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 20h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
    );
}

export function IconBell({ className }: Props) {
    return (
        <svg className={`shrink-0 ${className || ""}`} viewBox="0 0 24 24" fill="none">
            <path d="M6 9a6 6 0 0 1 12 0v5l2 2H4l2-2V9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
    );
}

// ИДЕАЛЬНО РОВНАЯ ШЕСТЕРЕНКА
export function IconSettings({ className }: Props) {
    return (
        <svg className={`shrink-0 ${className || ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    );
}