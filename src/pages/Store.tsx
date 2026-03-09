import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Panel, Pill, Skeleton } from "../components/ui";
import { useDeals } from "../hooks/useDeals";
import { useUserStore } from "../store/userStore";
import { useApp } from "../app/store";
import { useAnalytics } from "../hooks/useAnalytics";

export default function Store() {
    const { state } = useApp();
    const searchQuery = state.search || "";
    const { deals, loading, apiStatus } = useDeals(searchQuery);

    // ДОБАВИЛИ НАВИГАЦИЮ
    const navigate = useNavigate();

    // Движок аналитики
    const { trackEvent } = useAnalytics();

    // НОВАЯ ФУНКЦИЯ: Просто перекидывает на страницу игры внутри нашего приложения
    const handleCardClick = (gameId: string, gameTitle: string) => {
        trackEvent('VIEW_GAME_DETAILS', { game: gameTitle });
        navigate(`/game/${gameId}`);
    };

    return (
        <div className="h-full flex flex-col gap-5 overflow-hidden">
            <Panel className="p-6 flex-1 overflow-y-auto overflow-x-hidden relative bg-gradient-to-br from-indigo-950/20 via-black/40 to-blue-950/20">
                <div className="flex flex-col gap-4 mb-6 relative z-10 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-white/75 font-semibold">
                            {searchQuery ? `Результаты поиска: "${searchQuery}"` : "Сравнение цен агрегатора (Global)"}
                        </div>

                        <div className="flex gap-2">
                            {apiStatus === "online" && <Pill className="text-xs text-green-400/80 bg-green-400/10 border-green-400/20">Live API: Online</Pill>}
                            {apiStatus === "cache" && <Pill className="text-xs text-yellow-400/80 bg-yellow-400/10 border-yellow-400/20">Saved Cache Active</Pill>}
                            {apiStatus === "fallback" && <Pill className="text-xs text-orange-400/80 bg-orange-400/10 border-orange-400/20">Offline Mode</Pill>}
                        </div>
                    </div>

                    {apiStatus !== "online" && (
                        <div className="w-full p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3 shadow-lg">
                            <div className="text-yellow-400 mt-0.5 text-lg">⚠️</div>
                            <div>
                                <div className="text-sm text-yellow-400 font-bold tracking-wide">Внимание: Данные из кэша</div>
                                <div className="text-xs text-white/60 mt-1 leading-relaxed">
                                    Соединение с серверами магазинов временно недоступно. Мы показываем последние сохраненные цены.
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
                            <div key={deal.id} className="relative group cursor-pointer" onClick={() => handleCardClick(deal.id, deal.title)}>

                                {/* AMBIENT ПОДСВЕТКА */}
                                <div
                                    className="absolute -inset-1 rounded-3xl blur-2xl opacity-20 group-hover:opacity-60 transition duration-500 z-0"
                                    style={{
                                        backgroundImage: `url(${deal.thumb})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                />

                                {/* САМА КАРТОЧКА */}
                                <Card className="relative z-10 p-4 flex flex-col sm:flex-row gap-5 items-center bg-[#0a0f18]/80 border border-white/5 hover:border-white/20 backdrop-blur-xl transition-all">

                                    {/* ОБЛОЖКА */}
                                    <div className="w-full sm:w-40 h-24 rounded-xl overflow-hidden shrink-0 bg-black/50 shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-10">
                                        <img
                                            src={deal.thumb}
                                            alt={deal.title}
                                            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%230f172a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2364748b'%3EOffline%3C/text%3E%3C/svg%3E";
                                            }}
                                        />
                                    </div>

                                    {/* ИНФО */}
                                    <div className="flex-1 text-center sm:text-left w-full z-10">
                                        <h3 className="text-xl font-bold text-white leading-tight group-hover:text-blue-200 transition-colors drop-shadow-md">{deal.title}</h3>
                                        <p className="text-xs text-emerald-400 mt-1 uppercase tracking-wide font-semibold">
                                            Оригинал: ${deal.bestPriceUSD}
                                        </p>
                                        <p className="text-[10px] text-white/30 mt-1">
                                            ID: {deal.id} {deal.steamAppID && `| Steam ID: ${deal.steamAppID}`}
                                        </p>
                                    </div>

                                    {/* КНОПКА СРАВНЕНИЯ ЦЕН */}
                                    <div className="flex gap-3 w-full sm:w-auto shrink-0 z-10">
                                        <Button
                                            className="w-full sm:w-auto flex flex-col items-center py-2 px-6 bg-gradient-to-r from-blue-600/80 to-indigo-600/80 hover:from-blue-500 hover:to-indigo-500 text-white border border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] backdrop-blur-md transition-all rounded-xl"
                                        >
                                            <span className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5 flex items-center gap-1">
                                                Сравнить цены <span className="text-xs ml-1">→</span>
                                            </span>
                                            <span className="text-lg font-black">{deal.bestPriceKZT > 0 ? `от ${deal.bestPriceKZT} ₸` : 'FREE'}</span>
                                        </Button>
                                    </div>
                                </Card>
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