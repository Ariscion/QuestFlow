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
                        <div className="space-y-4">
                            <Skeleton className="h-[140px] w-full rounded-[20px]" />
                            <Skeleton className="h-[140px] w-full rounded-[20px]" />
                        </div>
                    ) : !deals || deals.length === 0 ? (
                        <div className="text-center py-10 text-white/50">
                            По запросу "{searchQuery}" ничего не найдено.
                        </div>
                    ) : (
                        deals.map((deal) => {
                            // БРОНЯ: Гарантируем, что цены всегда строки, даже если пришел кривой объект
                            const steamPriceStr = deal?.steamPrice || "Нет цены";
                            const epicPriceStr = deal?.epicPrice || "Нет цены";
                            const title = deal?.title || "Неизвестная игра";
                            const image = deal?.image || "";

                            // Флаги блокировки кнопок
                            const isSteamDisabled = steamPriceStr.includes("Эксклюзив");
                            const isEpicDisabled = epicPriceStr.includes("Эксклюзив");

                            // Математика
                            const steamVal = isSteamDisabled ? Infinity : parseInt(steamPriceStr.replace(/\D/g, '') || '0', 10);
                            const epicVal = isEpicDisabled ? Infinity : parseInt(epicPriceStr.replace(/\D/g, '') || '0', 10);
                            const bestDeal = steamVal < epicVal ? 'steam' : (epicVal < steamVal ? 'epic' : 'both');

                            return (
                                <div key={deal?.id || Math.random()} className="relative group">
                                    <img
                                        src={image}
                                        alt="Glow backdrop"
                                        className="absolute inset-0 w-full h-full object-cover rounded-[20px] blur-[60px] opacity-[0.25] group-hover:blur-[50px] group-hover:opacity-[0.4] transition-all duration-500 z-0 pointer-events-none"
                                    />

                                    <Card className="p-5 flex items-center gap-6 hover:bg-white/[0.12] transition-all duration-300 rounded-[20px] border border-white/10 relative z-10 bg-black/40 backdrop-blur-sm">
                                        <div className="relative shrink-0">
                                            <img
                                                src={image}
                                                alt={title}
                                                className="w-[200px] h-auto rounded-[14px] shadow-2xl object-cover border-2 border-white/5 relative z-10"
                                            />
                                            <div className="absolute inset-2 bg-white/20 blur-3xl z-0" />
                                        </div>

                                        <div className="flex-1 px-2">
                                            <div className="text-2xl text-white font-bold tracking-tight">{title}</div>
                                            <div className="text-xs text-white/45 mt-1.5 uppercase tracking-wider font-semibold">Официальные данные Live-API</div>
                                        </div>

                                        {/* Карточка Steam */}
                                        <div className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl min-w-[130px] border transition-all duration-300 ${isSteamDisabled ? 'opacity-40 grayscale' : bestDeal === 'steam' || bestDeal === 'both' ? 'bg-white/[0.08] border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.06)] scale-[1.03]' : 'bg-white/[0.02] border-white/5 opacity-70'}`}>
                                            <div className="text-xs tracking-wide text-white/60 font-medium">Steam</div>
                                            <div className="text-lg font-extrabold text-white text-center">{steamPriceStr}</div>
                                            <Button
                                                variant={bestDeal === 'steam' || bestDeal === 'both' ? 'primary' : 'soft'}
                                                onClick={() => !isSteamDisabled && handleActionClick(deal, 'Steam', steamPriceStr)}
                                                className="w-full"
                                                disabled={isSteamDisabled}
                                            >
                                                {isSteamDisabled ? "Недоступно" : "Купить"}
                                            </Button>
                                        </div>

                                        {/* Карточка Epic Games */}
                                        <div className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl min-w-[130px] border transition-all duration-300 ${isEpicDisabled ? 'opacity-40 grayscale' : bestDeal === 'epic' || bestDeal === 'both' ? 'bg-white/[0.08] border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.06)] scale-[1.03]' : 'bg-white/[0.02] border-white/5 opacity-70'}`}>
                                            <div className="text-xs tracking-wide text-white/60 font-medium">Epic Games</div>
                                            <div className="text-lg font-extrabold text-white text-center">{epicPriceStr}</div>
                                            <Button
                                                variant={bestDeal === 'epic' || bestDeal === 'both' ? 'primary' : 'soft'}
                                                onClick={() => !isEpicDisabled && handleActionClick(deal, 'Epic Games', epicPriceStr)}
                                                className="w-full"
                                                disabled={isEpicDisabled}
                                            >
                                                {isEpicDisabled ? "Недоступно" : "Купить"}
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            );
                        })
                    )}
                </div>
            </Panel>
        </div>
    );
}