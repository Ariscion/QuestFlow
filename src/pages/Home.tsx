import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Panel, Skeleton } from "../components/ui";
import { useAnalytics } from "../hooks/useAnalytics";
import { CheapSharkAPI, type CheapSharkTopDeal } from "../services/cheapSharkApi";

const USD_TO_KZT = 450;

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
          setTopDeals(deals.slice(0, 7));
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

  // НОВАЯ ФУНКЦИЯ: Ведет на страницу игры, а не в Steam
  const handleCardClick = (gameId: string, gameTitle: string) => {
    trackEvent('VIEW_GAME_DETAILS', { game: gameTitle, source: 'Home_TopDeals' });
    navigate(`/game/${gameId}`);
  };

  const heroDeal = topDeals.length > 0 ? topDeals[0] : null;
  const gridDeals = topDeals.length > 1 ? topDeals.slice(1) : [];

  return (
      <div className="h-full flex flex-col gap-5 overflow-hidden">
        <Panel className="p-6 flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-indigo-950/20 via-black/40 to-purple-950/20">

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
                {/* 1. ГЛАВНАЯ СКИДКА ДНЯ */}
                {heroDeal && (
                    // Клик по баннеру ведет на Game.tsx
                    <div className="relative group cursor-pointer" onClick={() => handleCardClick(heroDeal.gameID, heroDeal.title)}>
                      <div
                          className="absolute -inset-2 rounded-[2rem] blur-3xl opacity-30 group-hover:opacity-60 transition duration-700 z-0"
                          style={{ backgroundImage: `url(${heroDeal.thumb})`, backgroundSize: 'cover' }}
                      />
                      <Card className="relative z-10 p-0 overflow-hidden rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all bg-black/60 shadow-2xl flex flex-col md:flex-row">
                        <div className="md:w-1/2 lg:w-[60%] h-48 md:h-72 overflow-hidden relative">
                          <img
                              src={`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${heroDeal.steamAppID}/header.jpg`}
                              alt={heroDeal.title}
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                              onError={(e) => { e.currentTarget.src = heroDeal.thumb; }}
                          />
                          <div className="absolute top-4 left-4 bg-red-600 text-white font-black px-4 py-1.5 rounded-full text-sm shadow-lg shadow-red-900/50 animate-pulse">
                            СКИДКА ДНЯ -{Math.round(parseFloat(heroDeal.savings))}%
                          </div>
                        </div>
                        <div className="p-8 md:w-1/2 lg:w-[40%] flex flex-col justify-center backdrop-blur-md bg-gradient-to-l from-[#0f172a] to-transparent">
                          <h2 className="text-3xl font-black text-white leading-tight mb-2 group-hover:text-blue-300 transition-colors">{heroDeal.title}</h2>
                          <p className="text-gray-400 mb-6 line-through text-lg">${heroDeal.normalPrice}</p>

                          <div className="flex items-center gap-4 mt-auto">
                            <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] text-lg">
                              Сравнить цены от {Math.round(parseFloat(heroDeal.salePrice) * USD_TO_KZT)} ₸ →
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                )}

                {/* 2. СЕТКА ОСТАЛЬНЫХ СКИДОК */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {gridDeals.map((deal) => (
                      // Клик по карточке ведет на Game.tsx
                      <div key={deal.dealID} className="relative group cursor-pointer" onClick={() => handleCardClick(deal.gameID, deal.title)}>
                        <div
                            className="absolute -inset-1 rounded-2xl blur-xl opacity-20 group-hover:opacity-50 transition duration-500 z-0"
                            style={{ backgroundImage: `url(${deal.thumb})`, backgroundSize: 'cover' }}
                        />
                        <Card className="relative z-10 h-full p-4 flex flex-col bg-[#0a0f18]/90 border border-white/5 hover:border-white/20 backdrop-blur-xl transition-all rounded-2xl">
                          <div className="w-full h-32 rounded-xl overflow-hidden mb-4 relative">
                            <img
                                src={deal.thumb}
                                alt={deal.title}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute bottom-2 right-2 bg-red-600/90 backdrop-blur-sm text-white font-bold px-2 py-1 rounded-lg text-xs">
                              -{Math.round(parseFloat(deal.savings))}%
                            </div>
                          </div>

                          <h3 className="text-lg font-bold text-white leading-tight flex-1 group-hover:text-blue-200 transition-colors line-clamp-2">{deal.title}</h3>

                          <div className="flex items-end justify-between mt-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 line-through">${deal.normalPrice}</span>
                              <span className="text-xl font-black text-emerald-400">{Math.round(parseFloat(deal.salePrice) * USD_TO_KZT)} ₸</span>
                            </div>
                            <div className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white/70 transition-colors">
                              →
                            </div>
                          </div>
                        </Card>
                      </div>
                  ))}
                </div>
              </div>
          )}
        </Panel>
      </div>
  );
}