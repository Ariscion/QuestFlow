import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Card, Panel, Progress } from "../components/ui";
import { useAppStore } from "../store/appStore";
import { logoutUser } from "../lib/firebase";
import { useUserStore } from "../store/userStore";


export default function Settings() {
  const { motionEnabled, setMotionEnabled } = useAppStore();
  const nav = useNavigate();
  const { i18n, t } = useTranslation();
  const { reset, signOut, user, userLevel, userXP, xpToNextLevel, currencyInfo, setCurrencyInfo } = useUserStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const xpProgress = useMemo(() => {
    if (xpToNextLevel <= 0) return 0;
    return Math.max(0, Math.min(100, (userXP / xpToNextLevel) * 100));
  }, [userXP, xpToNextLevel]);

  const handleRegionChange = (countryCode: string) => {
    if (countryCode === "KZ") {
      setCurrencyInfo({ code: "KZT", symbol: "₸", rateToUSD: 450, countryCode: "KZ" });
    } else if (countryCode === "RU") {
      setCurrencyInfo({ code: "RUB", symbol: "₽", rateToUSD: 92, countryCode: "RU" });
    } else if (countryCode === "UA") {
      setCurrencyInfo({ code: "UAH", symbol: "₴", rateToUSD: 40, countryCode: "UA" });
    } else {
      setCurrencyInfo({ code: "USD", symbol: "$", rateToUSD: 1, countryCode });
    }
    localStorage.setItem("qf_currency_check", "true");
  };

  const handleClearCacheAndLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("qf_search_cache_v2");
      localStorage.removeItem("qf_analytics_logs");
      localStorage.removeItem("questflow-user-storage");
      reset();
      signOut();
      nav("/auth", { replace: true });
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-5 overflow-y-auto pr-1">
      <div className="text-sm text-white/65 font-semibold">{t('settings.title')}</div>

      <Panel className="p-6 border-slate-800">
        <div className="text-xs text-white/45 uppercase font-bold tracking-wider mb-4">{t('settings.profile.title')}</div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          <Card className="p-4 bg-slate-950/40 border border-slate-800/60 flex items-center gap-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="w-16 h-16 shrink-0 rounded-[18px] border border-slate-800 object-cover"
              />
            ) : (
              <div className="w-16 h-16 shrink-0 rounded-[18px] border border-slate-800 bg-slate-950 flex items-center justify-center text-white/90 font-bold">
                QF
              </div>
            )}

            <div className="min-w-0">
              <div className="text-base text-white/90 font-semibold truncate">{user?.name ?? t('common.guest')}</div>
              <div className="text-sm text-white/60 truncate">{user?.email ?? t('settings.profile.no_email')}</div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-950/40 border border-slate-800/60">
            <div className="flex items-center justify-between text-sm text-white/80">
              <span>{t('settings.profile.level')}</span>
              <span className="font-bold text-blue-300">{userLevel}</span>
            </div>
            <div className="mt-3">
              <Progress value={xpProgress} />
            </div>
            <div className="mt-2 text-xs text-white/55">
              {t('settings.profile.xp', { xp: userXP, total: xpToNextLevel })}
            </div>
          </Card>
        </div>
      </Panel>

      <Panel className="p-6 border-slate-800">
        <div className="text-xs text-white/45 uppercase font-bold tracking-wider mb-4">{t('settings.interface.title')}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


          <Card className="p-4 bg-slate-950/40 border border-slate-800/60">
            <div className="text-xs text-white/45">{t('settings.interface.animations.title')}</div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-white/65">{t('settings.interface.animations.desc')}</span>
              <input
                type="checkbox"
                checked={motionEnabled}
                onChange={(e) => setMotionEnabled(e.target.checked)}
                className="accent-blue-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </Card>


          <Card className="p-4 bg-slate-950/40 border border-slate-800/60">
            <div className="text-xs text-white/45">{t('settings.interface.region.title')}</div>
            <div className="mt-3">
              <select
                value={currencyInfo.countryCode}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-white/80 outline-none focus:border-blue-500/50"
              >
                <option value="KZ">Казахстан (KZ)</option>
                <option value="RU">Россия (RU)</option>
                <option value="TR">Турция (TR)</option>
                <option value="UA">Украина (UA)</option>
                <option value="US">США (US)</option>
              </select>
            </div>
          </Card>

          <Card className="p-4 bg-slate-950/40 border border-slate-800/60">
            <div className="text-xs text-white/45">{t('settings.interface.language.title')}</div>
            <div className="mt-3">
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-white/80 outline-none focus:border-blue-500/50"
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
                <option value="kk">Қазақша</option>
              </select>
            </div>
          </Card>
        </div>
      </Panel>

      {!window.Telegram?.WebApp?.initDataUnsafe?.user && (
        <Panel className="p-6 border-slate-800">
          <div className="text-xs text-white/45 uppercase font-bold tracking-wider mb-4">{t('settings.data.title')}</div>
          <Card className="p-4 bg-slate-950/40 border border-slate-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-sm text-white/80 font-bold">{t('settings.data.clear_cache.title')}</div>
              <div className="text-xs text-white/50 mt-1">{t('settings.data.clear_cache.desc')}</div>
            </div>
            <Button
              onClick={() => void handleClearCacheAndLogout()}
              className="shrink-0 bg-red-500/20 text-red-300 hover:bg-red-500/35 border-slate-800"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? t('settings.data.clear_cache.loading') : t('settings.data.clear_cache.button')}
            </Button>
          </Card>
        </Panel>
      )}
    </div>
  );
}