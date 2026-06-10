import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Panel, Skeleton, Pill } from "@/shared/ui/Primitives";
import { GameCover } from "@/entities/game/ui/GameCover";
import { useAnalytics } from "@/shared/lib/useAnalytics";
import { useTopDeals } from "@/entities/game/model/useTopDeals";
import { type CheapSharkTopDeal } from "@/shared/api/cheapSharkApi";
import { useUserStore } from "@/entities/user/model/userStore";
import { useTranslation } from "react-i18next";

const TOP_DEALS_LIMIT = 7;

type OpenDealHandler = (gameId: string, gameTitle: string) => void;

interface DealCardProps {
  deal: CheapSharkTopDeal;
  onOpenDeal: OpenDealHandler;
}

const formatSavings = (savings: string): number => Math.round(Number.parseFloat(savings));

const HeroDealCard = memo(function HeroDealCard({ deal, onOpenDeal }: DealCardProps) {
  const { t } = useTranslation();
  const rateToUSD = useUserStore((s) => s.currencyInfo.rateToUSD);
  const symbol = useUserStore((s) => s.currencyInfo.symbol);

  const handleOpen = useCallback(() => {
    onOpenDeal(deal.gameID, deal.title);
  }, [deal.gameID, deal.title, onOpenDeal]);

  const savingsPercent = useMemo(() => formatSavings(deal.savings), [deal.savings]);
  const salePriceLabel = useMemo(() => `${Math.round(Number.parseFloat(deal.salePrice) * rateToUSD)} ${symbol}`, [deal.salePrice, rateToUSD, symbol]);

  return (
    <button
      type="button"
      className="relative group cursor-pointer text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-3xl"
      onClick={handleOpen}
    >
      <Card className="relative z-10 p-0 overflow-hidden rounded-3xl border border-slate-800 hover:border-slate-700 transition-all bg-slate-900 shadow-xl flex flex-col md:flex-row">
        <div className="md:w-1/2 lg:w-[60%] h-48 md:h-72 overflow-hidden relative">
          <GameCover
            src={deal.thumb}
            steamAppID={deal.steamAppID}
            fallbackSrc={deal.thumb}
            alt={deal.title}
            className="w-full h-full transform group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-4 left-4 bg-red-600 text-white font-black px-4 py-1.5 rounded-full text-sm shadow-lg animate-pulse">
            {t('home.hero.discount_of_day', { percent: savingsPercent })}
          </div>
        </div>
        <div className="p-8 md:w-1/2 lg:w-[40%] flex flex-col justify-center bg-slate-900">
          <h2 className="text-3xl font-black text-white leading-tight mb-2 group-hover:text-blue-300 transition-colors">{deal.title}</h2>
          {(deal.steamRatingPercent || deal.metacriticScore) && (
            <div className="flex gap-2 items-center mb-4">
              {deal.steamRatingPercent && (
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full" title={`${deal.steamRatingCount ? Number(deal.steamRatingCount).toLocaleString('ru-RU') : ''} отзывов`}>
                  👍 {deal.steamRatingPercent}% ({deal.steamRatingText || 'Positive'})
                </span>
              )}
              {deal.metacriticScore && (
                <span className="text-xs text-yellow-400 font-bold bg-yellow-500/10 border border-yellow-500/25 px-2.5 py-0.5 rounded-full">
                  Ⓜ️ {deal.metacriticScore}
                </span>
              )}
            </div>
          )}
          <p className="text-gray-400 mb-6 line-through text-lg">${deal.normalPrice}</p>

          <div className="flex items-center gap-4 mt-auto">
            <Button
              type="button"
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl shadow-md text-lg"
            >
              {t('home.hero.compare_prices', { price: salePriceLabel })}
            </Button>
          </div>
        </div>
      </Card>
    </button>
  );
});

const DealGridCard = memo(function DealGridCard({ deal, onOpenDeal }: DealCardProps) {
  const rateToUSD = useUserStore((s) => s.currencyInfo.rateToUSD);
  const symbol = useUserStore((s) => s.currencyInfo.symbol);

  const handleOpen = useCallback(() => {
    onOpenDeal(deal.gameID, deal.title);
  }, [deal.gameID, deal.title, onOpenDeal]);

  const savingsPercent = useMemo(() => formatSavings(deal.savings), [deal.savings]);
  const salePriceLabel = useMemo(() => `${Math.round(Number.parseFloat(deal.salePrice) * rateToUSD)} ${symbol}`, [deal.salePrice, rateToUSD, symbol]);

  return (
    <button
      type="button"
      className="relative group cursor-pointer text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl"
      onClick={handleOpen}
    >
      <Card className="relative z-10 h-full p-4 flex flex-col bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all rounded-2xl shadow-sm">
        <div className="w-full h-32 rounded-xl overflow-hidden mb-4 relative">
          <GameCover
            src={deal.thumb}
            alt={deal.title}
            className="w-full h-full transform group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute bottom-2 right-2 bg-red-600 text-white font-bold px-2 py-1 rounded-lg text-xs">
            -{savingsPercent}%
          </div>
        </div>

        <h3 className="text-lg font-bold text-white leading-tight flex-1 group-hover:text-blue-200 transition-colors line-clamp-2">{deal.title}</h3>

        {(deal.steamRatingPercent || deal.metacriticScore) && (
          <div className="flex gap-1.5 items-center mt-2">
            {deal.steamRatingPercent && (
              <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded" title={`${deal.steamRatingText || 'Positive'} (${deal.steamRatingCount ? Number(deal.steamRatingCount).toLocaleString('ru-RU') : ''} отзывов)`}>
                👍 {deal.steamRatingPercent}%
              </span>
            )}
            {deal.metacriticScore && (
              <span className="text-[10px] text-yellow-400 font-extrabold bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded">
                Ⓜ️ {deal.metacriticScore}
              </span>
            )}
          </div>
        )}

        <div className="flex items-end justify-between mt-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 line-through">${deal.normalPrice}</span>
            <span className="text-xl font-black text-emerald-400">{salePriceLabel}</span>
          </div>
          <div className="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg text-white/70 transition-colors">
            →
          </div>
        </div>
      </Card>
    </button>
  );
});

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();

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

  const { data: topDeals = [], isLoading: loading, isError, isFetching } = useTopDeals(TOP_DEALS_LIMIT);

  const handleCardClick = useCallback<OpenDealHandler>((gameId, gameTitle) => {
    trackEvent("VIEW_GAME_DETAILS", { game: gameTitle, source: "Home_TopDeals" });
    navigate(`/game/${gameId}`);
  }, [navigate, trackEvent]);

  const { heroDeal, gridDeals } = useMemo(() => {
    const [firstDeal, ...restDeals] = topDeals;

    return {
      heroDeal: firstDeal ?? null,
      gridDeals: restDeals,
    };
  }, [topDeals]);

  return (
    <div className="h-full flex flex-col gap-5 overflow-hidden">
      <Panel className="p-6 flex-1 overflow-y-auto overflow-x-hidden">

        <div className="flex flex-col gap-4 mb-6 relative z-10 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-white drop-shadow-lg">
              🔥 {t('home.title_prefix')} <span className="text-blue-400">{t('home.title_suffix')}</span>
            </h1>

            <div className="flex gap-2">
              {isFetching && !loading && isOnline && <Pill className="text-xs text-blue-400/80 bg-blue-400/10 border-blue-400/20">{t('home.status.updating')}</Pill>}
              {!isFetching && !isError && isOnline && <Pill className="text-xs text-green-400/80 bg-green-400/10 border-green-400/20">{t('home.status.online')}</Pill>}
              {(!isOnline || isError) && <Pill className="text-xs text-orange-400/80 bg-orange-400/10 border-orange-400/20">{t('home.status.offline')}</Pill>}
            </div>
          </div>

          {(!isOnline || isError) && (
            <div className="w-full p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3 shadow-lg">
              <div className="text-yellow-400 mt-0.5 text-lg">⚠️</div>
              <div>
                <div className="text-sm text-yellow-400 font-bold tracking-wide">{t('home.offline_warning.title')}</div>
                <div className="text-xs text-white/60 mt-1 leading-relaxed">
                  {t('home.offline_warning.desc')}
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-64 w-full rounded-3xl opacity-10" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-48 rounded-2xl opacity-10" />
              <Skeleton className="h-48 rounded-2xl opacity-10" />
              <Skeleton className="h-48 rounded-2xl opacity-10" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {heroDeal && <HeroDealCard deal={heroDeal} onOpenDeal={handleCardClick} />}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {gridDeals.map((deal) => (
                <DealGridCard key={deal.dealID} deal={deal} onOpenDeal={handleCardClick} />
              ))}
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}