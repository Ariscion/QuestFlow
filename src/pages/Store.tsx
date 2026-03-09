import React from "react";
import { Button, Card, Panel, Pill, Skeleton } from "../components/ui";
import { useDeals } from "../hooks/useDeals";
import { useUserStore } from "../store/userStore";
import { useApp } from "../app/store"; // Подключаем ваш стор, чтобы достать текст поиска!
import { useNavigate } from "react-router-dom";

export default function Store() {
    // 1. Достаем строку поиска из шапки Layout (state.search)
    const { state } = useApp();

    const nav = useNavigate();

    // 2. Передаем строку поиска в наш хук. Теперь хук реагирует на ввод!
    const { deals, loading, apiStatus } = useDeals(state.search);

    const balanceKZT = useUserStore((s) => s.balanceKZT);
    const buyGame = useUserStore((s) => s.buyGame);
    const addClickXP = useUserStore((s) => s.addClickXP);

    const handleActionClick = (deal: any, storeName: string, price: string) => {
        addClickXP();
        const success = buyGame(deal, price, storeName);
        if (success) {
            alert(`[QuestFlow Store]\nИгра ${deal.title} успешно приобретена!\nПлатформа: ${storeName}\nСписано: ${price}\nИгра добавлена в Библиотеку.`);
        }
    };

    return (
        <div className="h-full flex flex-col gap-5 overflow-hidden">
            <div className="flex justify-between items-center shrink-0">
                <div className="text-sm text-white/65 font-semibold">Live Deals Aggregator</div>

                <div className="text-sm font-bold text-emerald-400 px-3 py-1 bg-emerald-400/10 rounded-full border border-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
                    Баланс: {balanceKZT.toLocaleString('ru-RU')} ₸
                </div>
            </div>

            <Panel className="p-6 flex-1 overflow-y-auto overflow-x-hidden relative bg-gradient-to-br from-indigo-950/20 via-black/40 to-blue-950/20">
                <div className="flex items-center justify-between mb-6 relative z-10 shrink-0">
                    <div className="text-sm text-white/75 font-semibold">
                        {state.search ? `Результаты поиска: "${state.search}"` : "Сравнение цен (Steam Live vs EGS Cache)"}
                    </div>

                    <div className="flex gap-2">
                        {apiStatus === "online" && <Pill className="text-xs text-green-400/80 bg-green-400/10 border-green-400/20 transition-all">Live API: Online</Pill>}
                        {apiStatus === "cache" && <Pill className="text-xs text-yellow-400/80 bg-yellow-400/10 border-yellow-400/20 transition-all">Saved Cache Active</Pill>}
                        {apiStatus === "fallback" && <Pill className="text-xs text-orange-400/80 bg-orange-400/10 border-orange-400/20 transition-all">Offline Defaults</Pill>}
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-6 relative z-10">
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-[140px] w-full rounded-[20px]" />
                            <Skeleton className="h-[140px] w-full rounded-[20px]" />
                        </div>
                    ) : deals.length === 0 ? (
                        <div className="text-center py-10 text-white/50">
                            По запросу "{state.search}" ничего не найдено.
                        </div>
                    ) : (
                        deals.map((deal) => {
                            // Хитрая математика: если эксклюзив, ставим огромную цену (Infinity), чтобы алгоритм не посчитал её выгодной
                            const steamVal = deal.steamPrice.includes("Эксклюзив") ? Infinity : parseInt(deal.steamPrice.replace(/\D/g, '') || '0', 10);
                            const epicVal = deal.epicPrice.includes("Эксклюзив") ? Infinity : parseInt(deal.epicPrice.replace(/\D/g, '') || '0', 10);

                            const bestDeal = steamVal < epicVal ? 'steam' : (epicVal < steamVal ? 'epic' : 'both');

                            // Флаги блокировки кнопок
                            const isSteamDisabled = deal.steamPrice.includes("Эксклюзив");
                            const isEpicDisabled = deal.epicPrice.includes("Эксклюзив");

                            return (
                                <div key={deal.id} className="relative group">
                                    <img
                                        src={deal.image}
                                        alt="Glow backdrop"
                                        className="absolute inset-0 w-full h-full object-cover rounded-[20px] blur-[60px] opacity-[0.25] group-hover:blur-[50px] group-hover:opacity-[0.4] transition-all duration-500 z-0 pointer-events-none"
                                    />

                                    <Card className="p-5 flex items-center gap-6 hover:bg-white/[0.12] transition-all duration-300 rounded-[20px] border border-white/10 relative z-10 bg-black/40 backdrop-blur-sm">
                                        <div
                                            className="relative shrink-0 cursor-pointer hover:scale-105 transition-transform duration-300"
                                            onClick={() => nav(`/game/${deal.id}`)}
                                        >
                                            <img
                                                src={deal.image}
                                                alt={deal.title}
                                                className="w-[200px] h-auto rounded-[14px] shadow-2xl object-cover border-2 border-white/5 relative z-10"
                                            />
                                            <div className="absolute inset-2 bg-white/20 blur-3xl z-0" />
                                        </div>

                                        <div
                                            className="flex-1 px-2 cursor-pointer group-hover:text-blue-200"
                                            onClick={() => nav(`/game/${deal.id}`)}
                                        >
                                            <div className="text-2xl text-white font-bold tracking-tight">{deal.title}</div>
                                            <div className="text-xs text-white/45 mt-1.5 uppercase tracking-wider font-semibold">Официальные данные Live-API</div>
                                        </div>

                                        {/* Карточка Steam */}
                                        <div className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl min-w-[130px] border transition-all duration-300 ${isSteamDisabled ? 'opacity-40 grayscale' : bestDeal === 'steam' || bestDeal === 'both' ? 'bg-white/[0.08] border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.06)] scale-[1.03]' : 'bg-white/[0.02] border-white/5 opacity-70'}`}>
                                            <div className="text-xs tracking-wide text-white/60 font-medium">Steam</div>
                                            <div className="text-lg font-extrabold text-white text-center">{deal.steamPrice}</div>
                                            <Button
                                                variant={bestDeal === 'steam' || bestDeal === 'both' ? 'primary' : 'soft'}
                                                onClick={() => !isSteamDisabled && handleActionClick(deal, 'Steam', deal.steamPrice)}
                                                className="w-full"
                                                disabled={isSteamDisabled}
                                            >
                                                {isSteamDisabled ? "Недоступно" : "Купить"}
                                            </Button>
                                        </div>

                                        {/* Карточка Epic Games */}
                                        <div className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl min-w-[130px] border transition-all duration-300 ${isEpicDisabled ? 'opacity-40 grayscale' : bestDeal === 'epic' || bestDeal === 'both' ? 'bg-white/[0.08] border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.06)] scale-[1.03]' : 'bg-white/[0.02] border-white/5 opacity-70'}`}>
                                            <div className="text-xs tracking-wide text-white/60 font-medium">Epic Games</div>
                                            <div className="text-lg font-extrabold text-white text-center">{deal.epicPrice}</div>
                                            <Button
                                                variant={bestDeal === 'epic' || bestDeal === 'both' ? 'primary' : 'soft'}
                                                onClick={() => !isEpicDisabled && handleActionClick(deal, 'Epic Games', deal.epicPrice)}
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