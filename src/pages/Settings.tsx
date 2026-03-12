import { useState, useEffect } from "react";
import { Button, Card, Panel } from "../components/ui";
import { useApp } from "../app/store";

export default function Settings() {
  const { state, actions } = useApp();
  const [cleared, setCleared] = useState(false);

  // Состояния для настроек внешнего вида
  const [glassIntensity, setGlassIntensity] = useState(55);
  const [motionEnabled, setMotionEnabled] = useState(true);

  // 1. Применяем CSS-переменную при изменении ползунка (размытие)
  useEffect(() => {
    document.documentElement.style.setProperty('--glass-opacity', `${glassIntensity / 100}`);
  }, [glassIntensity]);

  // 2. Реальное отключение анимаций (Accessibility Feature)
  useEffect(() => {
    if (motionEnabled) {
      document.body.classList.remove('disable-motion');
    } else {
      document.body.classList.add('disable-motion');
    }

    // Динамически внедряем стиль, который убивает все транзишены в проекте
    const styleId = 'qf-motion-control';
    let styleEl = document.getElementById(styleId);

    if (!motionEnabled && !styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = `
            body.disable-motion *, body.disable-motion *::before, body.disable-motion *::after {
                transition-duration: 0.001ms !important;
                animation-duration: 0.001ms !important;
            }
        `;
      document.head.appendChild(styleEl);
    } else if (motionEnabled && styleEl) {
      styleEl.remove();
    }
  }, [motionEnabled]);

  // QA-функции
  const handleClearCache = () => {
    localStorage.removeItem('qf_search_cache_v2');
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  const handleClearAnalytics = () => {
    const logs = JSON.parse(localStorage.getItem('qf_analytics_logs') || '[]');
    console.table(logs);
    alert(`В кэше ${logs.length} событий аналитики.\nОткройте Console (F12) в браузере для просмотра!`);
  };

  return (
      <div className="h-full flex flex-col gap-5 overflow-hidden">
        <div className="text-sm text-white/65 font-semibold">Настройки и QA Инструменты</div>

        <Panel className="p-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 bg-black/20 flex-1 overflow-y-auto">

          {/* ЛЕВАЯ КОЛОНКА: Аккаунт */}
          <div className="space-y-4">
            <Card className="p-4 bg-white/[0.02] border-white/5">
              <div className="text-xs text-white/45 uppercase font-bold tracking-wider">Аккаунт</div>
              <div className="text-sm text-white/80 font-semibold mt-1">{state.user?.name ?? "Ariscion"}</div>
              <div className="text-[11px] text-white/45 mt-1">{state.user?.provider ?? "QuestFlow ID"}</div>
            </Card>

            <Card className="p-4 bg-white/[0.02] border-white/5">
              <div className="text-xs text-white/45 uppercase font-bold tracking-wider">Уровень подписки</div>
              <div className="mt-3 flex gap-2">
                <Button variant={state.tier === "Free" ? "primary" : "soft"} onClick={() => actions.setTier("Free")} className={state.tier === "Free" ? "bg-blue-600" : ""}>Free</Button>
                <Button variant={state.tier === "Premium" ? "primary" : "soft"} onClick={() => actions.setTier("Premium")} className={state.tier === "Premium" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none" : ""}>Premium</Button>
              </div>
            </Card>
          </div>

          {/* ПРАВАЯ КОЛОНКА: Визуал и Данные */}
          <Panel className="p-6 bg-white/[0.01] border-white/5">
            <div className="text-sm text-white/75 font-semibold mb-4">Внешний вид (Appearance)</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card className="p-4 bg-white/[0.02] border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-xs text-white/45">Glass intensity (Размытие)</div>
                  <div className="text-xs text-blue-400 font-bold">{glassIntensity}%</div>
                </div>
                <div>
                  <input
                      type="range"
                      min={0}
                      max={100}
                      value={glassIntensity}
                      onChange={(e) => setGlassIntensity(Number(e.target.value))}
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
                      checked={motionEnabled}
                      onChange={(e) => setMotionEnabled(e.target.checked)}
                      className="accent-blue-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              </Card>
            </div>

            <div className="text-sm text-white/75 font-semibold mb-4 flex items-center gap-2">
              <span className="text-blue-400">⚙️</span> QA & Developer Tools
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] border-white/5">
                <div>
                  <div className="text-sm text-white/80 font-bold">Кэш API (Offline Mode)</div>
                  <div className="text-xs text-white/50 mt-1 max-w-md">Удаляет сохраненные запросы. Полезно для тестирования поведения при отсутствии сети.</div>
                </div>
                <Button
                    onClick={handleClearCache}
                    className={`shrink-0 transition-colors ${cleared ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400 hover:bg-red-500/40'}`}
                >
                  {cleared ? '✓ Очищено' : 'Очистить кэш API'}
                </Button>
              </Card>

              <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] border-white/5">
                <div>
                  <div className="text-sm text-white/80 font-bold">Веб-Аналитика</div>
                  <div className="text-xs text-white/50 mt-1 max-w-md">Выгрузка локальных логов кликов (CTR) и переходов для отчета по Веб-Аналитике.</div>
                </div>
                <Button variant="soft" onClick={handleClearAnalytics} className="shrink-0 bg-blue-500/20 text-blue-400 hover:bg-blue-500/40">
                  Вывести логи (F12)
                </Button>
              </Card>

              <Card className="p-4 flex items-center justify-between gap-3 bg-white/[0.02] border-white/5">
                <div className="text-xs text-white/65">Сбросить состояние аккаунта (localStorage)</div>
                <Button
                    variant="ghost"
                    className="text-white/40 hover:text-white"
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = "/";
                    }}
                >
                  Hard Reset
                </Button>
              </Card>
            </div>
          </Panel>

        </Panel>
      </div>
  );
}