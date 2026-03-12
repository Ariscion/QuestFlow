import type { ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../app/store";
import { cn } from "../lib/cn";

export type SearchProps = {
    className?: string;
    inputClassName?: string;
    placeholder?: string;
    redirectPath?: string;
    autoRedirect?: boolean;
    showClearButton?: boolean;
};

const DEFAULT_PLACEHOLDER = "Поиск игр (например, Cyberpunk)...";
const DEFAULT_REDIRECT_PATH = "/store";

export default function Search({
    className,
    inputClassName,
    placeholder = DEFAULT_PLACEHOLDER,
    redirectPath = DEFAULT_REDIRECT_PATH,
    autoRedirect = true,
    showClearButton = true,
}: SearchProps) {
    const {
        state: { search },
        actions,
    } = useApp();
    const location = useLocation();
    const navigate = useNavigate();

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextQuery = event.target.value;
        actions.setSearch(nextQuery);

        if (autoRedirect && nextQuery.trim() && location.pathname !== redirectPath) {
            navigate(redirectPath);
        }
    };

    const handleClear = () => {
        actions.setSearch("");
    };

    return (
        <div className={cn("relative w-full max-w-md group", className)}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-white/40 transition-colors group-focus-within:text-blue-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
            </div>

            <input
                type="text"
                placeholder={placeholder}
                value={search}
                onChange={handleSearchChange}
                className={cn(
                    "w-full rounded-xl border border-white/10 bg-[#0a0f18]/60 py-2.5 pl-10 pr-4 text-white placeholder-white/40 shadow-[0_4px_15px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                    showClearButton && search ? "pr-10" : "pr-4",
                    inputClassName,
                )}
            />

            {showClearButton && search && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/40 transition-colors hover:text-white"
                    aria-label="Очистить поиск"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}