import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Panel, Pill, Skeleton, GameCover } from "../components/ui";
import { useDeals } from "../hooks/useDeals";
import { useAppStore } from "../store/appStore";
import { useAnalytics } from "../hooks/useAnalytics";
import { useTranslation } from "react-i18next";

export default function Store() {
    const { t } = useTranslation();
    const search = useAppStore(state => state.search);
    const searchQuery = search || "";
    const { data: deals = [], isLoading, isError, isFetching } = useDeals(searchQuery);

    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

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
            <Panel className="p-6 flex-1 overflow-y-auto overflow-x-hidden">
                <div className="flex flex-col gap-4 mb-6 relative z-10 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-white/75 font-semibold">
                            {searchQuery ? t('store.results.search', { query: searchQuery }) : t('store.results.default')}
                        </div>

                        <div className="flex gap-2">
                            {isFetching && !isLoading && isOnline && <Pill className="text-xs text-blue-400/80 bg-blue-400/10 border-blue-400/20">{t('store.status.updating')}</Pill>}
                            {!isFetching && !isError && isOnline && <Pill className="text-xs text-green-400/80 bg-green-400/10 border-green-400/20">{t('store.status.online')}</Pill>}
                            {(!isOnline || isError) && <Pill className="text-xs text-orange-400/80 bg-orange-400/10 border-orange-400/20">{t('store.status.offline')}</Pill>}
                        </div>
                    </div>

                    {(!isOnline || isError) && (
                        <div className="w-full p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3 shadow-lg">
                            <div className="text-yellow-400 mt-0.5 text-lg">⚠️</div>
                            <div>
                                <div className="text-sm text-yellow-400 font-bold tracking-wide">{t('store.offline_warning.title')}</div>
                                <div className="text-xs text-white/60 mt-1 leading-relaxed">
                                    {t('store.offline_warning.desc')}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-6 relative z-10">
                    {isLoading ? (
                        <div className="flex flex-col gap-4">
                            <Skeleton className="h-28 w-full rounded-2xl opacity-10" />
                            <Skeleton className="h-28 w-full rounded-2xl opacity-10" />
                            <Skeleton className="h-28 w-full rounded-2xl opacity-10" />
                        </div>
                    ) : deals.length > 0 ? (
                        deals.map((deal) => (
                            <div key={deal.id} className="relative group cursor-pointer" onClick={() => handleCardClick(deal.id, deal.title)}>

                                {/* САМА КАРТОЧКА */}
                                <Card className="relative z-10 p-4 flex flex-col sm:flex-row gap-5 items-center bg-slate-900 border border-slate-800/60 hover:border-slate-750 transition-all shadow-sm">

                                    {/* ОБЛОЖКА */}
                                    <div className="w-full sm:w-40 h-24 rounded-xl overflow-hidden shrink-0 bg-black/50 shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-10">
                                        <GameCover
                                            src={deal.thumb}
                                            steamAppID={deal.steamAppID}
                                            alt={deal.title}
                                            className="w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* ИНФО */}
                                    <div className="flex-1 text-center sm:text-left w-full z-10">
                                        <h3 className="text-xl font-bold text-white leading-tight group-hover:text-blue-200 transition-colors drop-shadow-md">{deal.title}</h3>
                                        <p className="text-xs text-emerald-400 mt-1 uppercase tracking-wide font-semibold">
                                             {t('store.deal.best_price', { price: deal.bestPriceLocal > 0 ? `${deal.bestPriceLocal} ${deal.currency}` : t('store.deal.no_data') })}
                                        </p>
                                        <p className="text-[10px] text-white/30 mt-1">
                                            ID: {deal.id} {deal.steamAppID && `| Steam ID: ${deal.steamAppID}`}
                                        </p>
                                    </div>

                                    {/* КНОПКА СРАВНЕНИЯ ЦЕН */}
                                    <div className="flex gap-3 w-full sm:w-auto shrink-0 z-10">
                                        <Button
                                            className="w-full sm:w-auto flex flex-col items-center py-2 px-6 bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/30 transition-all rounded-xl shadow-md"
                                        >
                                            <span className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5 flex items-center gap-1">
                                                {t('store.deal.compare_prices')}
                                            </span>
                                            <span className="text-lg font-black">{deal.bestPriceLocal > 0 ? t('store.deal.from_price', { price: `${deal.bestPriceLocal} ${deal.currency}` }) : t('store.deal.free')}</span>
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-12 text-slate-500 border border-slate-800 rounded-2xl bg-slate-950/40">
                            {searchQuery ? t('store.empty.not_found') : t('store.empty.start_typing')}
                        </div>
                    )}
                </div>
            </Panel>
        </div>
    );
}