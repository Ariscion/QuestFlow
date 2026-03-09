import React from "react";
import { Button, Card, Panel, Pill, Skeleton } from "../components/ui";
import { useDeals } from "../hooks/useDeals";
import { useUserStore } from "../store/userStore";
import { useApp } from "../app/store";
import { useAnalytics } from "../hooks/useAnalytics"; // <-- ПОДКЛЮЧИЛИ АНАЛИТИКУ

export default function Store() {
    const appContext = useApp();
    const searchQuery = appContext?.state?.search || "";
    const { deals, loading, apiStatus } = useDeals(searchQuery);

    const balanceKZT = useUserStore((s) => s.balanceKZT);
    const buyGame = useUserStore((s) => s.buyGame);
    const addClickXP = useUserStore((s) => s.addClickXP);

    // Инициализируем наш движок аналитики
    const { trackEvent } = useAnalytics();

    const handleActionClick = (deal: any, storeName: string, price: string) => {
        // --- ВЕБ-АНАЛИТИКА: Фиксируем клик (считаем CTR) ---
        trackEvent('CLICK_BUY_BUTTON', {
            game: deal.title,
            targetStore: storeName,
            price: price,
            isFromCache: apiStatus !== "online"
        });

        addClickXP();
        const success = buyGame(deal, price, storeName);
        if (success) {
            trackEvent('PURCHASE_SUCCESS', { game: deal.title, store: storeName });
            alert(`[QuestFlow Store]\nИгра ${deal.title} успешно приобретена!\nПлатформа: ${storeName}\nСписано: ${price}\nИгра добавлена в Библиотеку.`);
        }
    };

    return (
        <div className="h-full flex flex-col gap-5 overflow-hidden">
            <div className="flex justify-between items-center shrink-0">
                <div className="text-sm text-white/65 font-semibold">Live Deals Aggregator</div>

                <div className="text-sm font-bold text-emerald-400 px-3 py-1 bg-emerald-400/10 rounded-full border border-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
                    Баланс: {balanceKZT?.toLocaleString('ru-RU') || 0} ₸
                </div>
            </div>

            <Panel className="p-6 flex-1 overflow-y-auto overflow-x-hidden relative bg-gradient-to-br from-indigo-950/20 via-black/40 to-blue-950/20">
                <div className="flex flex-col gap-4 mb-6 relative z-10 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-white/75 font-semibold">
                            {searchQuery ? `Результаты поиска: "${searchQuery}"` : "Сравнение цен (Steam Live vs EGS Cache)"}
                        </div>

                        <div className="flex gap-2">
                            {apiStatus === "online" && <Pill className="text-xs text-green-400/80 bg-green-400/10 border-green-400/20">Live API: Online</Pill>}
                            {apiStatus === "cache" && <Pill className="text-xs text-yellow-400/80 bg-yellow-400/10 border-yellow-400/20">Saved Cache Active</Pill>}
                            {apiStatus === "fallback" && <Pill className="text-xs text-orange-400/80 bg-orange-400/10 border-orange-400/20">Offline Defaults</Pill>}
                        </div>
                    </div>

                    {/* --- ЭТИКА В ЦИФРОВОМ МИРЕ: Прозрачность данных --- */}
                    {apiStatus !== "online" && (
                        <div className="w-full p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                            <div className="text-yellow-400 mt-0.5">⚠️</div>
                            <div>
                                <div className="text-sm text-yellow-400 font-bold">Внимание: Данные из кэша</div>
                                <div className="text-xs text-white/60 mt-1">
                                    Соединение с серверами магазинов временно недоступно. Мы показываем последние сохраненные цены. Финальная стоимость при переходе в магазин может отличаться.
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-6 relative z-10">
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            <Skeleton className="h-28 w-full rounded-2xl opacity-10" />
                            <Skeleton className="h-28 w-full rounded-2xl opacity-10" />
                            <Skeleton className="h-28 w-full rounded-2xl opacity-10" />
                        </div>
                    ) : deals.length > 0 ? (
                        deals.map((deal) => (
                            <div key={deal.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row gap-5 items-center hover:bg-white/10 transition-colors backdrop-blur-sm">

                                {/* 1. ОБЛОЖКА ИЗ API CHEAPSHARK */}
                                <div className="w-full sm:w-40 h-24 rounded-xl overflow-hidden shrink-0 bg-black/50 shadow-lg">
                                    <img
                                        src={deal.thumb}
                                        alt={deal.title}
                                        className="w-full h-full object-cover object-center"
                                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x200/1a1a2e/ffffff?text=No+Image' }}
                                    />
                                </div>

                                {/* 2. ИНФО */}
                                <div className="flex-1 text-center sm:text-left w-full">
                                    <h3 className="text-xl font-bold text-white leading-tight">{deal.title}</h3>
                                    <p className="text-xs text-emerald-400 mt-1 uppercase tracking-wide font-semibold">
                                        Оригинал: ${deal.bestPriceUSD}
                                    </p>
                                    <p className="text-[10px] text-white/40 mt-1">
                                        ID: {deal.id} {deal.steamAppID && `| Steam ID: ${deal.steamAppID}`}
                                    </p>
                                </div>

                                {/* 3. ЦЕНА В ТЕНГЕ И КНОПКА */}
                                <div className="flex gap-3 w-full sm:w-auto shrink-0">
                                    <Button
                                        onClick={() => handleActionClick(deal, "Лучшая цена", `${deal.bestPriceKZT} ₸`)}
                                        className="w-full sm:w-auto flex flex-col items-center py-2 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white border-none"
                                    >
                                        <span className="text-[10px] uppercase tracking-wider opacity-80 mb-0.5">Лучшая цена</span>
                                        <span className="text-lg font-black">{deal.bestPriceKZT > 0 ? `${deal.bestPriceKZT} ₸` : 'FREE'}</span>
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-12 text-white/50 border border-white/5 rounded-2xl bg-black/20">
                            {searchQuery ? "Игры не найдены. Попробуйте другой запрос." : "Введите название игры в поиск выше."}
                        </div>
                    )}
                </div>
            </Panel>
        </div>
    );
}