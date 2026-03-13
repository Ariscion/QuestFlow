import { useEffect, type ReactNode } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApp, useIsAuthed, useIsReady } from "../app/store";
import { cn } from "../lib/cn";
import { logoutUser } from "../lib/firebase";
import Search from "../pages/Search";
import { useUserStore } from "../store/userStore";
import { IconBell, IconDownloads, IconHome, IconLibrary, IconSettings, IconStore } from "./icons";

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
    const { state, actions } = useApp();
    const isAuthed = useIsAuthed();
    const isReady = useIsReady();
    const nav = useNavigate();
    const loc = useLocation();

    // Guard: если не авторизован или не прошёл onboarding — отправляем на /auth
    useEffect(() => {
        if (loc.pathname === "/auth") return;
        if (!isAuthed || !isReady) nav("/auth", { replace: true });
    }, [isAuthed, isReady, loc.pathname, nav]);

    const isNavigationDisabled = !isAuthed || !isReady;

    async function handleLogout() {
        try {
            await logoutUser();
            useUserStore.getState().reset();
            actions.signOut();
            nav("/auth");
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="qf-frame w-[1180px] max-w-[96vw] h-[720px] max-h-[92vh] flex">
                {/* Rail (Боковое меню) */}
                <div className="w-[88px] p-4 flex flex-col items-center gap-3 border-r border-white/10 shrink-0">
                    {isAuthed && state.user?.avatar ? (
                        <img
                            src={state.user.avatar}
                            alt="Profile"
                            className="w-12 h-12 shrink-0 rounded-[16px] border border-white/10 object-cover shadow-inner"
                        />
                    ) : (
                        <div className="w-12 h-12 shrink-0 rounded-[16px] border border-white/10 bg-gradient-to-br from-blue-600/20 to-cyan-600/10 flex items-center justify-center text-white/90 font-bold shadow-inner">
                            QF
                        </div>
                    )}

                    <div className="mt-2 flex flex-col gap-3">
                        <RailItem to="/home" disabled={isNavigationDisabled} icon={<IconHome className="w-5 h-5 text-white/70" />} />
                        <RailItem to="/store" disabled={isNavigationDisabled} icon={<IconStore className="w-5 h-5 text-white/70" />} />
                        <RailItem to="/library" disabled={isNavigationDisabled} icon={<IconLibrary className="w-5 h-5 text-white/70" />} />
                        <RailItem to="/downloads" disabled={isNavigationDisabled} icon={<IconDownloads className="w-5 h-5 text-white/70" />} />
                        <RailItem to="/notifications" disabled={isNavigationDisabled} icon={<IconBell className="w-5 h-5 text-white/70" />} />
                        <RailItem to="/settings" disabled={isNavigationDisabled} icon={<IconSettings className="w-5 h-5 text-white/70" />} />
                    </div>

                    <div className="mt-auto w-full flex flex-col items-center gap-2">
                        <div className="text-[11px] text-white/40 text-center">{state.tier}</div>
                        <button
                            type="button"
                            className={cn("qf-btn qf-btn-ghost w-full px-0", !isAuthed && "opacity-40")}
                            onClick={() => (isAuthed ? handleLogout() : nav("/auth"))}
                        >
                            {isAuthed ? "Выход" : "Войти"}
                        </button>
                    </div>
                </div>

                {/* Main */}
                <div className="flex-1 p-5 flex flex-col gap-4 overflow-hidden">
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
    return (
        <div className="flex items-center justify-center shrink-0">
            <div className="w-[520px] max-w-[90%]">
                <Search
                    className="max-w-none"
                    inputClassName="rounded-full border-white/8 bg-transparent py-2 text-sm text-white/80 placeholder:text-white/35 shadow-none"
                    placeholder="Поиск игр (например, Witcher)..."
                />
            </div>
        </div>
    );
}