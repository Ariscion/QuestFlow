import React from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApp, useIsAuthed, useIsReady } from "../app/store";
import { IconBell, IconDownloads, IconHome, IconSettings, IconStore } from "./icons";
import { cn } from "../lib/cn";

function RailItem({ to, icon, disabled }: { to: string; icon: React.ReactNode; disabled?: boolean }) {
    const base = "w-10 h-10 rounded-[14px] border border-white/10 bg-white/[0.05] flex items-center justify-center";
    if (disabled) return <div className={cn(base, "opacity-40")}>{icon}</div>;
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(base, isActive ? "bg-white/[0.10] border-white/[0.18] shadow-[0_0_15px_rgba(255,255,255,0.05)]" : "hover:bg-white/[0.08]")
            }
        >
            {icon}
        </NavLink>
    );
}

export default function Layout() {
    const { state, actions } = useApp();
    const isAuthed = useIsAuthed();
    const isReady = useIsReady();
    const nav = useNavigate();
    const loc = useLocation();

    // Guard: если не авторизован или не прошёл onboarding — отправляем на /auth
    React.useEffect(() => {
        if (loc.pathname === "/auth") return;
        if (!isAuthed || !isReady) nav("/auth", { replace: true });
    }, [isAuthed, isReady, loc.pathname, nav]);

    const disabled = !isAuthed || !isReady;

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="qf-frame w-[1180px] max-w-[96vw] h-[720px] max-h-[92vh] flex">
                {/* Rail (Боковое меню) */}
                <div className="w-[88px] p-4 flex flex-col items-center gap-3 border-r border-white/10">
                    {/* Аватарка (можно потом тоже привязать к Zustand) */}
                    <div className="w-12 h-12 rounded-[16px] border border-white/10 bg-gradient-to-br from-blue-600/20 to-cyan-600/10 flex items-center justify-center text-white/90 font-bold shadow-inner">
                        QF
                    </div>

                    <div className="mt-2 flex flex-col gap-3">
                        <RailItem to="/home" disabled={disabled} icon={<IconHome className="w-5 h-5 text-white/70" />} />
                        <RailItem to="/store" disabled={disabled} icon={<IconStore className="w-5 h-5 text-white/70" />} />

                        {/* НОВАЯ КНОПКА: Библиотека (Используем встроенный SVG для надежности) */}
                        <RailItem
                            to="/library"
                            disabled={disabled}
                            icon={
                                <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            }
                        />

                        <RailItem to="/downloads" disabled={disabled} icon={<IconDownloads className="w-5 h-5 text-white/70" />} />
                        <RailItem to="/notifications" disabled={disabled} icon={<IconBell className="w-5 h-5 text-white/70" />} />
                        <RailItem to="/settings" disabled={disabled} icon={<IconSettings className="w-5 h-5 text-white/70" />} />
                    </div>

                    <div className="mt-auto w-full flex flex-col items-center gap-2">
                        <div className="text-[11px] text-white/40">{state.tier}</div>
                        <button
                            className={cn("qf-btn qf-btn-ghost w-full", !isAuthed && "opacity-40")}
                            onClick={() => (isAuthed ? actions.signOut() : nav("/auth"))}
                        >
                            {isAuthed ? "Sign out" : "Sign in"}
                        </button>
                    </div>
                </div>

                {/* Main */}
                <div className="flex-1 p-5 flex flex-col gap-4">
                    <TopBar />
                    <div className="flex-1 overflow-auto pr-1">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}

function TopBar() {
    const { state, actions } = useApp();
    const nav = useNavigate();
    const loc = useLocation(); // Добавили чтобы знать, где мы сейчас

    return (
        <div className="flex items-center justify-center">
            <div className="w-[520px] max-w-[90%]">
                <div className="qf-pill flex items-center gap-2">
                    <span className="text-white/45 text-sm">🔎</span>
                    <input
                        className="bg-transparent outline-none text-sm w-full text-white/80 placeholder:text-white/35"
                        placeholder="Поиск игр (например, Witcher)..."
                        value={state.search}
                        onChange={(e) => actions.setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            // Если нажали Enter и мы НЕ в магазине - кидаем в магазин
                            if (e.key === "Enter" && loc.pathname !== "/store") {
                                nav("/store");
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}