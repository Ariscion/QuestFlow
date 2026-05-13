import { useEffect, type ChangeEvent, type KeyboardEvent, type ReactNode } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAppStore } from "../store/appStore";
import { Button } from "../components/ui";
import { cn } from "../lib/cn";
import { logoutUser, saveUserDataToDb } from "../lib/firebase";
import { useUserStore } from "../store/userStore";
import { IconBell, IconDownloads, IconHelp, IconHome, IconLibrary, IconSettings, IconStore } from "./icons";

type RailItemProps = {
    to: string;
    icon: ReactNode;
    disabled?: boolean;
};

function RailItem({ to, icon, disabled = false }: RailItemProps) {
    const base = "w-10 h-10 rounded-[14px] border border-white/10 bg-white/[0.05] flex items-center justify-center shrink-0";
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
    const { tier } = useAppStore();
    const { isAuthed, isReady, reset, signOut, user } = useUserStore();
    const nav = useNavigate();
    const loc = useLocation();
    const { t } = useTranslation();

    // Guard: если не авторизован и не гость — отправляем на /auth
    useEffect(() => {
        if (loc.pathname === "/auth") return;
        const state = useUserStore.getState();
        if (!state.isAuthed && !state.isGuest) nav("/auth", { replace: true });
    }, [isAuthed, isReady, loc.pathname, nav]);

    // Telegram WebApp: инициализация и привязка ID
    useEffect(() => {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();

            const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
            if (tgUser?.id && user?.uid) {
                // Сохраняем telegramId в Firestore для текущего пользователя
                void saveUserDataToDb(user.uid, { telegramId: tgUser.id });
                console.log("Telegram ID linked:", tgUser.id);
            }
        }
    }, [user]);

    const isNavigationDisabled = !isAuthed && !useUserStore.getState().isGuest;

    async function handleLogout() {
        try {
            if (isAuthed) {
                await logoutUser();
            }
            reset();
            signOut();
            nav("/auth");
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="h-[100dvh] w-full flex items-center justify-center sm:p-6 bg-neutral-950 sm:bg-transparent overflow-hidden">
            <div className="w-full h-full sm:w-[1180px] sm:max-w-[96vw] sm:h-[720px] sm:max-h-[92vh] flex flex-col-reverse sm:flex-row overflow-hidden sm:rounded-3xl sm:border border-neutral-800 bg-neutral-900/65 shadow-none sm:shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl relative">
                {/* Rail / Bottom Bar */}
                <div className="w-full sm:w-[88px] h-[72px] sm:h-auto p-2 sm:p-4 flex flex-row sm:flex-col items-center justify-center sm:justify-start border-t sm:border-t-0 sm:border-r border-white/10 shrink-0 bg-neutral-900/95 sm:bg-transparent pb-[env(safe-area-inset-bottom)] sm:pb-4 z-50">
                    {isAuthed && user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt="Profile"
                            className="hidden sm:block w-12 h-12 shrink-0 rounded-[16px] border border-white/10 object-cover shadow-inner"
                        />
                    ) : (
                        <div className="hidden sm:flex w-12 h-12 shrink-0 rounded-[16px] border border-white/10 bg-gradient-to-br from-blue-600/20 to-cyan-600/10 items-center justify-center text-white/90 font-bold shadow-inner">
                            QF
                        </div>
                    )}

                    <div className="flex flex-row sm:flex-col justify-between sm:justify-center w-full px-2 sm:px-0 sm:mt-2 sm:gap-3 items-center">
                        <RailItem to="/home" disabled={isNavigationDisabled} icon={<IconHome className="w-5 h-5 text-white/70" />} />
                        <RailItem to="/store" disabled={isNavigationDisabled} icon={<IconStore className="w-5 h-5 text-white/70" />} />
                        <RailItem to="/library" disabled={isNavigationDisabled} icon={<IconLibrary className="w-5 h-5 text-white/70" />} />
                        {!window.Telegram?.WebApp?.initDataUnsafe?.user && (
                            <RailItem to="/downloads" disabled={isNavigationDisabled} icon={<IconDownloads className="w-5 h-5 text-white/70" />} />
                        )}
                        <RailItem to="/notifications" disabled={isNavigationDisabled} icon={<IconBell className="w-5 h-5 text-white/70" />} />
                        <RailItem to="/help-ethics" disabled={isNavigationDisabled} icon={<IconHelp className="w-5 h-5 text-white/70" />} />
                        <RailItem to="/settings" disabled={isNavigationDisabled} icon={<IconSettings className="w-5 h-5 text-white/70" />} />
                    </div>

                    <div className="hidden sm:flex mt-auto w-full flex-col items-center gap-2">
                        <div className="text-[11px] text-white/40 text-center">{tier}</div>
                        <Button
                            type="button"
                            variant="ghost"
                            className={cn("w-full px-0", (!isAuthed && !useUserStore.getState().isGuest) && "opacity-40")}
                            onClick={() => ((isAuthed || useUserStore.getState().isGuest) ? handleLogout() : nav("/auth"))}
                        >
                            {isAuthed ? t('common.exit') : t('common.login')}
                        </Button>
                    </div>
                </div>

                {/* Main */}
                <div className="flex-1 p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 overflow-hidden pt-[env(safe-area-inset-top)] sm:pt-5">
                    <TopBar />
                    <div className="flex-1 overflow-auto pr-1">
                        <Outlet />
                    </div>
                </div>

                {/* Mobile Search FAB (Hidden if on Store) */}
                {loc.pathname !== "/store" && (
                    <button
                        onClick={() => nav("/store")}
                        className="sm:hidden fixed bottom-[88px] right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full shadow-[0_4px_20px_rgba(37,99,235,0.5)] flex items-center justify-center z-50 text-white transition-transform active:scale-95 border border-white/10"
                        aria-label={t('common.search_games')}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

function TopBar() {
    const { t } = useTranslation();
    const { search, setSearch } = useAppStore();
    const navigate = useNavigate();
    const location = useLocation();

    const goToSearch = () => {
        if (location.pathname !== "/store") {
            navigate("/store");
        }
    };

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
        goToSearch();
    };

    const handleSearchFocus = () => {
        goToSearch();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            goToSearch();
        }
    };

    const isStore = location.pathname === "/store";

    useEffect(() => {
        if (isStore) {
            // Small delay to allow the element to become visible (display: flex) before focusing
            const timer = setTimeout(() => {
                document.getElementById("mobile-search-input")?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isStore]);

    return (
        <div className={cn("items-center justify-center shrink-0 w-full", isStore ? "flex" : "hidden sm:flex")}>
            <div className="relative w-full sm:w-[520px] sm:max-w-[90%] group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-white/40 transition-colors group-focus-within:text-blue-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                </div>

                <input
                    id="mobile-search-input"
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={t('common.search_placeholder')}
                    className="w-full rounded-full border border-white/8 bg-[#ffffff05] py-3 sm:py-2 pl-11 pr-4 text-sm text-white/80 placeholder:text-white/35 shadow-none outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/30 transition-all focus:bg-[#ffffff0a]"
                />
            </div>
        </div>
    );
}