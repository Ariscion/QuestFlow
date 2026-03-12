import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Panel, Pill, Skeleton } from "../components/ui";
import type { Game as LibraryGame } from "../store/userStore";
import { useUserStore } from "../store/userStore";
import { useAnalytics } from "../hooks/useAnalytics";
import { STORE_NAMES } from "../services/cheapSharkApi";

const USD_TO_KZT = 450;

interface CheapSharkGameDeal {
  dealID: string;
  storeID: string;
  price: string;
  retailPrice: string;
  savings: string;
}

interface CheapSharkGameInfo {
  title: string;
  steamAppID: string | null;
  thumb: string;
}

interface CheapSharkGameDetails {
  info: CheapSharkGameInfo;
  deals: CheapSharkGameDeal[];
  cheapestPriceEver?: {
    price: string;
  };
}

interface SteamGenre {
  id: number;
  description: string;
}

interface SteamScreenshot {
  id: number;
  path_thumbnail: string;
}

interface SteamAppDetails {
  short_description?: string;
  background?: string;
  genres?: SteamGenre[];
  screenshots?: SteamScreenshot[];
}

interface SteamAppDetailsResult {
  success: boolean;
  data: SteamAppDetails;
}

type SteamAppDetailsResponse = Record<string, SteamAppDetailsResult>;

interface GamePageState {
  requestedId: string | null;
  csGame: CheapSharkGameDetails | null;
  steamDetails: SteamAppDetails | null;
}

export default function Game() {
  const { id } = useParams<{ id: string }>(); // Это теперь ID игры из CheapShark
  const nav = useNavigate();
  const { trackEvent } = useAnalytics();

  const buyGame = useUserStore((s) => s.buyGame);
  const library = useUserStore((s) => s.library);

  const [gameState, setGameState] = useState<GamePageState>({
    requestedId: null,
    csGame: null,
    steamDetails: null,
  });

  const isOwned = library.some(g => g.id === id);
  const loading = Boolean(id) && gameState.requestedId !== id;
  const csGame = gameState.requestedId === id ? gameState.csGame : null;
  const steamDetails = gameState.requestedId === id ? gameState.steamDetails : null;

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchGameDetails = async () => {
      try {
        // 1. Идем в CheapShark за инфой об игре и ВСЕМИ скидками на неё
        const gameResponse = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${id}`);
        if (!gameResponse.ok) {
          throw new Error("CheapShark response was not ok");
        }

        const gameData = await gameResponse.json() as CheapSharkGameDetails;
        let nextSteamDetails: SteamAppDetails | null = null;

        // 2. Если есть Steam ID, тянем картинки и описание оттуда
        if (gameData.info.steamAppID) {
          try {
            const steamResponse = await fetch(`/api/steam/appdetails?appids=${gameData.info.steamAppID}&l=russian`);
            if (steamResponse.ok) {
              const steamData = await steamResponse.json() as SteamAppDetailsResponse;
              if (steamData[gameData.info.steamAppID]?.success) {
                nextSteamDetails = steamData[gameData.info.steamAppID].data;
              }
            }
          } catch (error) {
            console.error("Ошибка Steam API:", error);
          }
        }

        if (!isMounted) return;

        setGameState({
          requestedId: id,
          csGame: gameData,
          steamDetails: nextSteamDetails,
        });
      } catch (error) {
        console.error("Ошибка CheapShark API:", error);
        if (!isMounted) return;

        setGameState({
          requestedId: id,
          csGame: null,
          steamDetails: null,
        });
      }
    };

    void fetchGameDetails();

    return () => { isMounted = false; };
  }, [id]);

  const handleCpaSync = (deal: CheapSharkGameDeal) => {
    if (!id || !csGame) {
      return;
    }

    const storeName = STORE_NAMES[deal.storeID] || `Store #${deal.storeID}`;
    const kztPrice = Math.round(parseFloat(deal.price) * USD_TO_KZT);

    // 1. Синхронизируем игру в нашу Библиотеку (денег не берем)
    const gameToSync: LibraryGame = {
      id,
      title: csGame.info.title,
      image: csGame.info.thumb,
      steamPrice: deal.price,
      epicPrice: deal.retailPrice
    };

    buyGame(gameToSync, `${kztPrice} ₸`, storeName);
    trackEvent('CPA_REDIRECT_AND_SYNC', { game: csGame.info.title, store: storeName });

    // 2. Формируем хитрую CPA-ссылку (CheapShark дает прямую рефералку!)
    const storeUrl = `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`;
    window.open(storeUrl, '_blank');
  };

  if (loading) {
    return (
        <div className="h-full flex flex-col gap-4 p-6">
          <Skeleton className="h-[380px] w-full rounded-[24px] opacity-10" />
          <div className="flex gap-4">
            <Skeleton className="h-[200px] flex-1 rounded-[24px] opacity-10" />
            <Skeleton className="h-[300px] w-[340px] rounded-[24px] opacity-10" />
          </div>
        </div>
    );
  }

  if (!csGame || !csGame.info) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-white/50">
          <div className="text-4xl mb-4">🕵️‍♂️</div>
          <h2 className="text-xl font-bold text-white/80">Игра не найдена</h2>
          <Button variant="soft" className="mt-4" onClick={() => nav("/store")}>Вернуться в магазин</Button>
        </div>
    );
  }

  const cleanDescription = steamDetails?.short_description
      ? steamDetails.short_description.replace(/<[^>]*>?/gm, '')
      : "Детальное описание доступно в выбранном магазине.";

  return (
      <div className="h-full flex flex-col overflow-y-auto overflow-x-hidden relative rounded-2xl">
        {/* --- HERO СЕКЦИЯ --- */}
        <div className="relative w-full h-[380px] shrink-0">
          <img
              src={steamDetails?.background || csGame.info.thumb}
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

          <div className="absolute bottom-0 left-0 w-full p-8 flex items-end justify-between gap-6">
            <div className="flex-1">
              <Button variant="ghost" className="mb-4 text-white/50 hover:text-white" onClick={() => nav(-1)}>
                ← Назад
              </Button>
              <h1 className="text-5xl font-black text-white drop-shadow-xl">{csGame.info.title}</h1>
              <div className="flex gap-3 mt-4 items-center">
                {steamDetails?.genres?.slice(0, 3).map((g) => (
                    <Pill key={g.id} className="bg-white/10 text-white/80 border-white/20 backdrop-blur-md">
                      {g.description}
                    </Pill>
                ))}
                {csGame.cheapestPriceEver && (
                    <Pill className="bg-red-500/20 text-red-400 border-red-500/30">
                      Исторический минимум: ${csGame.cheapestPriceEver.price}
                    </Pill>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- ОСНОВНОЙ КОНТЕНТ --- */}
        <div className="p-8 flex flex-col xl:flex-row gap-8 relative z-10 bg-slate-950 flex-1">

          {/* Левая колонка */}
          <div className="flex-1 flex flex-col gap-8">
            <Panel className="p-6 bg-white/[0.02] border-white/5">
              <h3 className="text-lg font-bold text-white/90 mb-3">Об игре</h3>
              <p className="text-white/60 leading-relaxed text-sm">
                {cleanDescription}
              </p>
            </Panel>

            {steamDetails?.screenshots && (
                <div>
                  <h3 className="text-lg font-bold text-white/90 mb-4">Скриншоты</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {steamDetails.screenshots.slice(0, 4).map((shot) => (
                        <img
                            key={shot.id}
                            src={shot.path_thumbnail}
                            alt="Screenshot"
                            className="w-full rounded-xl border border-white/10 hover:scale-105 transition-transform cursor-pointer shadow-lg"
                        />
                    ))}
                  </div>
                </div>
            )}
          </div>

          {/* Правая колонка: БЛОК АГРЕГАТОРА (Магазины) */}
          <div className="w-full xl:w-[400px] shrink-0 flex flex-col gap-5">
            <Panel className="p-6 bg-gradient-to-br from-indigo-900/10 to-blue-900/5 border-blue-500/20 sticky top-4">
              <h3 className="text-xl font-black text-white mb-4">Сравнение цен</h3>

              {isOwned ? (
                  <div className="text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4">
                    <div className="text-3xl mb-2">✅</div>
                    <div className="text-emerald-400 font-bold mb-1">Синхронизировано</div>
                    <div className="text-xs text-emerald-400/60 mb-4">Игра уже добавлена в вашу библиотеку QuestFlow</div>
                    <Button variant="primary" className="w-full bg-emerald-600 hover:bg-emerald-500 border-none" onClick={() => nav("/library")}>
                      Открыть библиотеку
                    </Button>
                  </div>
              ) : (
                  <div className="flex flex-col gap-3">
                    {/* Выводим все доступные магазины, где есть эта игра */}
                    {csGame.deals.map((deal) => {
                      const storeName = STORE_NAMES[deal.storeID] || `Store #${deal.storeID}`;
                      const kztPrice = Math.round(parseFloat(deal.price) * USD_TO_KZT);
                      const isDiscount = parseFloat(deal.savings) > 0;

                      return (
                          <Card key={deal.dealID} className="p-3 flex justify-between items-center bg-[#0a0f18]/80 hover:bg-white/[0.08] transition-colors border-white/10 group">
                            <div>
                              <div className="text-sm font-bold text-white/90">{storeName}</div>
                              <div className="flex items-center gap-2 mt-1">
                                {isDiscount && (
                                    <span className="text-xs text-white/40 line-through">${deal.retailPrice}</span>
                                )}
                                <span className="text-lg font-black text-emerald-400">{kztPrice} ₸</span>
                              </div>
                            </div>
                            <Button
                                onClick={() => handleCpaSync(deal)}
                                className="bg-white/10 hover:bg-blue-600 text-white border-none group-hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all"
                            >
                              Перейти ↗
                            </Button>
                          </Card>
                      );
                    })}
                  </div>
              )}

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="text-xs text-blue-300 font-medium flex gap-2 items-start">
                  <span>ℹ️</span>
                  <span>При переходе в магазин игра автоматически добавится в вашу локальную библиотеку QuestFlow для быстрого доступа.</span>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
  );
}