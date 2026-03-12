import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEventHandler,
  type ReactEventHandler,
} from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Panel, Skeleton } from "../components/ui";
import { useAnalytics } from "../hooks/useAnalytics";
import { CheapSharkAPI, type CheapSharkTopDeal } from "../services/cheapSharkApi";

const USD_TO_KZT = 450;
const TOP_DEALS_LIMIT = 7;

type OpenDealHandler = (gameId: string, gameTitle: string) => void;

interface DealCardProps {
  deal: CheapSharkTopDeal;
  onOpenDeal: OpenDealHandler;
}

const formatSavings = (savings: string): number => Math.round(Number.parseFloat(savings));

const formatPriceInKzt = (price: string): string => `${Math.round(Number.parseFloat(price) * USD_TO_KZT)} ₸`;

const getHeroImageSrc = (steamAppID: string | null, fallbackThumb: string): string => {
  if (!steamAppID) {
    return fallbackThumb;
  }

  return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamAppID}/header.jpg`;
};

function createImageFallbackHandler(fallbackSrc: string): ReactEventHandler<HTMLImageElement> {
  return (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = fallbackSrc;
  };
}

function createOpenOnEnterOrSpace(
  onOpen: () => void,
): KeyboardEventHandler<HTMLDivElement> {
  return (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onOpen();
  };
}

const HeroDealCard = memo(function HeroDealCard({ deal, onOpenDeal }: DealCardProps) {
  const handleOpen = useCallback(() => {
    onOpenDeal(deal.gameID, deal.title);
  }, [deal.gameID, deal.title, onOpenDeal]);

  const handleKeyDown = useMemo(() => createOpenOnEnterOrSpace(handleOpen), [handleOpen]);
  const handleImageError = useMemo(() => createImageFallbackHandler(deal.thumb), [deal.thumb]);
  const savingsPercent = useMemo(() => formatSavings(deal.savings), [deal.savings]);
  const salePriceLabel = useMemo(() => formatPriceInKzt(deal.salePrice), [deal.salePrice]);
  const heroImageSrc = useMemo(() => getHeroImageSrc(deal.steamAppID, deal.thumb), [deal.steamAppID, deal.thumb]);

  return (
    <div
      className="relative group cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute -inset-2 rounded-4xl blur-3xl opacity-30 group-hover:opacity-60 transition duration-700 z-0"
        style={{ backgroundImage: `url(${deal.thumb})`, backgroundSize: "cover" }}
      />
      <Card className="relative z-10 p-0 overflow-hidden rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all bg-black/60 shadow-2xl flex flex-col md:flex-row">
        <div className="md:w-1/2 lg:w-[60%] h-48 md:h-72 overflow-hidden relative">
          <img
            src={heroImageSrc}
            alt={deal.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            onError={handleImageError}
          />
          <div className="absolute top-4 left-4 bg-red-600 text-white font-black px-4 py-1.5 rounded-full text-sm shadow-lg shadow-red-900/50 animate-pulse">
            СКИДКА ДНЯ -{savingsPercent}%
          </div>
        </div>
        <div className="p-8 md:w-1/2 lg:w-[40%] flex flex-col justify-center backdrop-blur-md bg-linear-to-l from-[#0f172a] to-transparent">
          <h2 className="text-3xl font-black text-white leading-tight mb-2 group-hover:text-blue-300 transition-colors">{deal.title}</h2>
          <p className="text-gray-400 mb-6 line-through text-lg">${deal.normalPrice}</p>

          <div className="flex items-center gap-4 mt-auto">
            <Button
              type="button"
              className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] text-lg"
            >
              Сравнить цены от {salePriceLabel} →
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
});

const DealGridCard = memo(function DealGridCard({ deal, onOpenDeal }: DealCardProps) {
  const handleOpen = useCallback(() => {
    onOpenDeal(deal.gameID, deal.title);
  }, [deal.gameID, deal.title, onOpenDeal]);

  const handleKeyDown = useMemo(() => createOpenOnEnterOrSpace(handleOpen), [handleOpen]);
  const savingsPercent = useMemo(() => formatSavings(deal.savings), [deal.savings]);
  const salePriceLabel = useMemo(() => formatPriceInKzt(deal.salePrice), [deal.salePrice]);

  return (
    <div
      className="relative group cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute -inset-1 rounded-2xl blur-xl opacity-20 group-hover:opacity-50 transition duration-500 z-0"
        style={{ backgroundImage: `url(${deal.thumb})`, backgroundSize: "cover" }}
      />
      <Card className="relative z-10 h-full p-4 flex flex-col bg-[#0a0f18]/90 border border-white/5 hover:border-white/20 backdrop-blur-xl transition-all rounded-2xl">
        <div className="w-full h-32 rounded-xl overflow-hidden mb-4 relative">
          <img
            src={deal.thumb}
            alt={deal.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute bottom-2 right-2 bg-red-600/90 backdrop-blur-sm text-white font-bold px-2 py-1 rounded-lg text-xs">
            -{savingsPercent}%
          </div>
        </div>

        <h3 className="text-lg font-bold text-white leading-tight flex-1 group-hover:text-blue-200 transition-colors line-clamp-2">{deal.title}</h3>

        <div className="flex items-end justify-between mt-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 line-through">${deal.normalPrice}</span>
            <span className="text-xl font-black text-emerald-400">{salePriceLabel}</span>
          </div>
          <div className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white/70 transition-colors">
            →
          </div>
        </div>
      </Card>
    </div>
  );
});

export default function Home() {
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();

  const [topDeals, setTopDeals] = useState<CheapSharkTopDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDeals = async () => {
      try {
        const deals = await CheapSharkAPI.getTopDeals();
        if (isMounted) {
          setTopDeals(deals.slice(0, TOP_DEALS_LIMIT));
        }
      } catch (error) {
        console.error("Ошибка загрузки скидок:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDeals();

    return () => { isMounted = false; };
  }, []);

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
      <Panel className="p-6 flex-1 overflow-y-auto overflow-x-hidden bg-linear-to-br from-indigo-950/20 via-black/40 to-purple-950/20">

        <h1 className="text-2xl font-black text-white mb-6 drop-shadow-lg">
          🔥 Горячие предложения <span className="text-blue-400">QuestFlow</span>
        </h1>

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