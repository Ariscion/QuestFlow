import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Panel, Progress } from "../components/ui";
import { useApp } from "../app/store";
import { logoutUser } from "../lib/firebase";
import { useUserStore } from "../store/userStore";

type CurrencyState = { currency?: string };
type CurrencyActions = { setCurrency?: (currency: string) => void };

export default function Settings() {
  const { state, actions } = useApp();
  const nav = useNavigate();
  const { userLevel, userXP, xpToNextLevel } = useUserStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const xpProgress = useMemo(() => {
    if (xpToNextLevel <= 0) return 0;
    return Math.max(0, Math.min(100, (userXP / xpToNextLevel) * 100));
  }, [userXP, xpToNextLevel]);

  const appStateWithCurrency = state as typeof state & CurrencyState;
  const appActionsWithCurrency = actions as typeof actions & CurrencyActions;
  const hasCurrencyControl = typeof appStateWithCurrency.currency === "string" && typeof appActionsWithCurrency.setCurrency === "function";

  useEffect(() => {
    document.documentElement.style.setProperty("--glass-opacity", `${state.glassIntensity / 100}`);
  }, [state.glassIntensity]);

  useEffect(() => {
    if (state.motionEnabled) {
      document.body.classList.remove('disable-motion');
    } else {
      document.body.classList.add('disable-motion');
    }

    // Динамически внедряем стиль, который убивает все транзишены в проекте
    const styleId = 'qf-motion-control';
    let styleEl = document.getElementById(styleId);

    if (!state.motionEnabled && !styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = `
            body.disable-motion *, body.disable-motion *::before, body.disable-motion *::after {
                transition-duration: 0.001ms !important;
                animation-duration: 0.001ms !important;
            }
        `;
      document.head.appendChild(styleEl);
    } else if (state.motionEnabled && styleEl) {
      styleEl.remove();
    }
  }, [state.motionEnabled]);

  const handleClearCacheAndLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logoutUser();
      localStorage.removeItem("qf_search_cache_v2");
      localStorage.removeItem("qf_analytics_logs");
      localStorage.removeItem("questflow-user-storage");
      localStorage.removeItem("qf_demo_state_v1");
      actions.signOut();
      nav("/auth", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-5 overflow-y-auto pr-1">
      <div className="text-sm text-white/65 font-semibold">Настройки профиля и интерфейса</div>

      <Panel className="p-6 bg-black/20 border-white/10">
        <div className="text-xs text-white/45 uppercase font-bold tracking-wider mb-4">Профиль</div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          <Card className="p-4 bg-white/[0.02] border-white/5 flex items-center gap-4">
            {state.user?.avatar ? (
              <img
                src={state.user.avatar}
                alt="Profile"
                className="w-16 h-16 shrink-0 rounded-[18px] border border-white/10 object-cover shadow-inner"
              />
            ) : (
              <div className="w-16 h-16 shrink-0 rounded-[18px] border border-white/10 bg-gradient-to-br from-blue-600/20 to-cyan-600/10 flex items-center justify-center text-white/90 font-bold shadow-inner">
                QF
              </div>
            )}

            <div className="min-w-0">
              <div className="text-base text-white/90 font-semibold truncate">{state.user?.name ?? "Гость"}</div>
              <div className="text-sm text-white/60 truncate">{state.user?.email ?? "Email не указан"}</div>
            </div>
          </Card>

          <Card className="p-4 bg-white/[0.02] border-white/5">
            <div className="flex items-center justify-between text-sm text-white/80">
              <span>Уровень</span>
              <span className="font-bold text-blue-300">{userLevel}</span>
            </div>
            <div className="mt-3">
              <Progress value={xpProgress} />
            </div>
            <div className="mt-2 text-xs text-white/55">
              XP: {userXP} / {xpToNextLevel}
            </div>
          </Card>
        </div>
      </Panel>

      <Panel className="p-6 bg-black/20 border-white/10">
        <div className="text-xs text-white/45 uppercase font-bold tracking-wider mb-4">Интерфейс</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 bg-white/[0.02] border-white/5">
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/45">Прозрачность стекла</div>
              <div className="text-xs text-blue-300 font-bold">{state.glassIntensity}%</div>
            </div>
            <div className="mt-3">
              <input
                type="range"
                min="0"
                max="100"
                value={state.glassIntensity}
                onChange={(e) => actions.setGlassIntensity(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </Card>

          <Card className="p-4 bg-white/[0.02] border-white/5">
            <div className="text-xs text-white/45">Motion (Анимации)</div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-white/65">Плавные переходы UI</span>
              <input
                type="checkbox"
                checked={state.motionEnabled}
                onChange={(e) => actions.setMotionEnabled(e.target.checked)}
                className="accent-blue-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </Card>

          <Card className="p-4 bg-white/[0.02] border-white/5">
            <div className="text-xs text-white/45">Валюта</div>
            <div className="mt-3">
              {hasCurrencyControl ? (
                <select
                  value={appStateWithCurrency.currency}
                  onChange={(e) => appActionsWithCurrency.setCurrency?.(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/80 outline-none"
                >
                  <option value="KZT">KZT</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              ) : (
                <div className="text-sm text-white/65">Сейчас используется базовая валюта сервиса.</div>
              )}
            </div>
          </Card>
        </div>
      </Panel>

      <Panel className="p-6 bg-black/20 border-white/10">
        <div className="text-xs text-white/45 uppercase font-bold tracking-wider mb-4">Данные</div>
        <Card className="p-4 bg-white/[0.02] border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-sm text-white/80 font-bold">Очистить кэш и выйти</div>
            <div className="text-xs text-white/50 mt-1">Удаляет локальные кэши и завершает сессию аккаунта.</div>
          </div>
          <Button
            onClick={() => void handleClearCacheAndLogout()}
            className="shrink-0 bg-red-500/20 text-red-300 hover:bg-red-500/35"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Выходим..." : "Очистить кэш и выйти"}
          </Button>
        </Card>
      </Panel>
    </div>
  );
}