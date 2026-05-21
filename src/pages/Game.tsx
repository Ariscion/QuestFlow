import { useParams, useNavigate } from "react-router-dom";
import { Button, Panel, Pill, Skeleton } from "../components/ui";
import type { Game as LibraryGame } from "../store/userStore";
import { useUserStore } from "../store/userStore";
import { useAnalytics } from "../hooks/useAnalytics";
import { STORE_NAMES } from "../services/cheapSharkApi";
import { useGameDetails } from "../hooks/useGameDetails";
import { useTranslation } from "react-i18next";
import { resolveStoreUrl } from "../lib/affiliate";
import { PriceAlertButton } from "../components/PriceAlertButton";

interface GamePageDeal {
    dealID: string;
    storeID: string;
    price: string;
    retailPrice: string;
    savings: string;
    storeName?: string;
    currency?: string;
}


export default function Game() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>(); // Это теперь ID игры из CheapShark
  const nav = useNavigate();
  const { trackEvent } = useAnalytics();

  const addClickXP = useUserStore((s) => s.addClickXP);
  const library = useUserStore((s) => s.library);
  const wishlist = useUserStore((s) => s.wishlist);
  const toggleWishlist = useUserStore((s) => s.toggleWishlist);
  const currencyInfo = useUserStore((s) => s.currencyInfo);
  const removeGame = useUserStore((s) => s.removeGame);

  const isInLibrary = library.some(g => g.id === id);
  const isInWishlist = wishlist?.some(g => g.id === id);
  
  const { csGame, steamDetails, isLoading } = useGameDetails(id);

  const handleStoreClick = (deal: GamePageDeal) => {
    if (!csGame) return;

    const storeName = STORE_NAMES[deal.storeID] || deal.storeID;
    addClickXP();
    trackEvent('CPA_REDIRECT_AND_SYNC', { game: csGame.info.title, store: storeName });

    const storeUrl = resolveStoreUrl(deal.dealID);
    window.open(storeUrl, '_blank');
  };

  const handleAddToLibrary = (deal: GamePageDeal) => {
    if (!id || !csGame || isInLibrary) return;

    const gameToSync: LibraryGame = {
      id,
      title: csGame.info.title,
      image: csGame.info.thumb,
      steamPrice: deal.price ?? "0",
      epicPrice: deal.retailPrice ?? "0"
    };

    const storeName = deal.storeName || STORE_NAMES[deal.storeID] || t('game.store_fallback');
    let purchasedPrice = `${deal.price} ${deal.currency || currencyInfo.code}`;

    if (storeName === "Steam" && steamDetails?.price_overview) {
      purchasedPrice = steamDetails.price_overview.final_formatted;
    }

    useUserStore.getState().buyGame(gameToSync, purchasedPrice, storeName);
  };

  const scrollToStores = () => {
    document.getElementById("stores-section")?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggleWishlist = () => {
    if (!id || !csGame) return;
    const gameToSync: LibraryGame = {
      id,
      title: csGame.info.title,
      image: csGame.info.thumb,
      steamPrice: csGame.deals?.[0]?.price ?? "0",
      epicPrice: csGame.deals?.[0]?.retailPrice ?? "0"
    };
    toggleWishlist(gameToSync);
  };

  if (isLoading) {
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
          <h2 className="text-xl font-bold text-white/80">{t('game.not_found')}</h2>
          <Button variant="soft" className="mt-4" onClick={() => nav("/store")}>{t('game.to_deals')}</Button>
        </div>
    );
  }

  const cleanDescription = steamDetails?.short_description
      ? steamDetails.short_description.replace(/<[^>]*>?/gm, '')
      : t('game.default_description');

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
              <Button
                  variant="soft"
                  onClick={() => nav(-1)}
                  className="mb-6 bg-black/50 text-white/70 hover:bg-black/70 hover:text-white border-white/10"
              >
                {t('game.back')}
              </Button>
              <h1 className="text-3xl sm:text-5xl font-black text-white drop-shadow-xl">{csGame.info.title}</h1>
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 items-center">
                {steamDetails?.genres?.slice(0, 3).map((g) => (
                    <Pill key={g.id} className="bg-white/10 text-white/80 border-white/20 backdrop-blur-md">
                      {g.description}
                    </Pill>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-3">
                <Button
                    variant={isInLibrary ? "soft" : "primary"}
                    onClick={isInLibrary ? () => removeGame(id!) : scrollToStores}
                    className={isInLibrary ? "bg-red-500/20 text-red-300 hover:bg-red-500/40 border border-red-500/30 flex-1 sm:flex-none" : "bg-blue-600 hover:bg-blue-500 border-none flex-1 sm:flex-none"}
                >
                  {isInLibrary ? t('game.actions.remove_library') : t('game.actions.add_library')}
                </Button>
                <button
                    onClick={handleToggleWishlist}
                    className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all border shrink-0 ${
                        isInWishlist 
                            ? "bg-rose-500/20 border-rose-500/50 text-rose-400 hover:bg-rose-500/30" 
                            : "bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white"
                    }`}
                    title={isInWishlist ? t('game.actions.remove_wishlist') : t('game.actions.add_wishlist')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" className="w-5 h-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- ОСНОВНОЙ КОНТЕНТ --- */}
        <div className="p-4 sm:p-8 flex flex-col xl:flex-row gap-6 sm:gap-8 relative z-10 bg-slate-950 flex-1">

          {/* Левая колонка */}
          <div className="flex-1 flex flex-col gap-6 sm:gap-8">
            <Panel className="p-4 sm:p-6 bg-white/[0.02] border-white/5">
              <h3 className="text-lg font-bold text-white/90 mb-3">{t('game.about')}</h3>
              <p className="text-white/60 leading-relaxed text-sm">
                {cleanDescription}
              </p>
            </Panel>

            {steamDetails?.screenshots && (
                <div>
                  <h3 className="text-lg font-bold text-white/90 mb-4">{t('game.screenshots')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="w-full xl:w-[400px] shrink-0 flex flex-col gap-5" id="stores-section">
            <Panel className="p-6 bg-gradient-to-br from-indigo-900/10 to-blue-900/5 border-blue-500/20 sticky top-4">
              <h3 className="text-xl font-black text-white mb-4">{t('game.price_comparison')}</h3>
              <div className="text-xs text-white/60 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-4 flex items-center gap-2">
                <span>⚠️</span>
                <span>{t('game.warning')}</span>
              </div>
              <div className="flex flex-col gap-3">
                {/* Only show verified stores from STORE_NAMES */}
                {(csGame.deals && csGame.deals.length > 0) ? (
                  csGame.deals
                    .filter((deal: GamePageDeal) => Boolean(STORE_NAMES[deal.storeID]))
                    .map((deal: GamePageDeal, idx: number) => {
                      const storeName = STORE_NAMES[deal.storeID];
                      const isDiscount = parseFloat(deal.savings) > 0;

                    // Steam: if we have regional data from Steam API, prefer it
                    let priceDisplay = `${deal.price} USD`;
                    let originalDisplay = `${deal.retailPrice} USD`;
                    let convertedPrice = "";
                    let convertedOriginal = "";

                    if (storeName === "Steam" && steamDetails?.price_overview) {
                      priceDisplay = steamDetails.price_overview.final_formatted;
                      originalDisplay = steamDetails.price_overview.initial_formatted;
                    } else if (currencyInfo.code !== "USD") {
                      const localPrice = Math.round(parseFloat(deal.price) * currencyInfo.rateToUSD);
                      const localRetail = Math.round(parseFloat(deal.retailPrice) * currencyInfo.rateToUSD);
                      
                      if (storeName === "Steam" && currencyInfo.code === "RUB") {
                        priceDisplay = `${localPrice} ₽`;
                        originalDisplay = `${localRetail} ₽`;
                      } else {
                        convertedPrice = `(~${localPrice} ${currencyInfo.symbol})`;
                        convertedOriginal = `(~${localRetail} ${currencyInfo.symbol})`;
                      }
                    }

                    return (
                      <div key={`${deal.storeID}-${idx}`} className="p-3 flex flex-col gap-3 rounded-xl bg-[#0a0f18]/80 hover:bg-white/[0.08] transition-colors border border-white/10 group">
                        <div className="flex justify-between items-center gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-white/90">{storeName}</div>
                            <div className="flex flex-col gap-0.5 mt-1">
                              {isDiscount && (
                                <div className="flex items-baseline gap-1">
                                  <span className="text-xs text-white/40 line-through">{originalDisplay}</span>
                                  {convertedOriginal && <span className="text-[10px] text-white/30 line-through">{convertedOriginal}</span>}
                                  <span className="text-xs font-bold text-red-400 ml-1.5">-{Math.round(parseFloat(deal.savings))}%</span>
                                </div>
                              )}
                              <div className="flex items-baseline gap-1 flex-wrap">
                                <span className="text-lg font-black text-emerald-400">{priceDisplay}</span>
                                {convertedPrice && <span className="text-xs font-medium text-emerald-400/70 ml-1">{convertedPrice}</span>}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStoreClick(deal)}
                            className="px-4 py-2 text-sm font-bold bg-white/10 hover:bg-blue-600 text-white rounded-lg group-hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all shrink-0"
                          >
                            {t('game.open')}
                          </button>
                        </div>
                        {!isInLibrary && (
                          <button
                            type="button"
                            onClick={() => handleAddToLibrary(deal)}
                            className="w-full text-xs py-1.5 border border-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30 transition-all rounded-lg text-white/50"
                          >
                            {t('game.add_from_store')}
                          </button>
                        )}
                        <PriceAlertButton
                          gameID={id!}
                          title={csGame.info.title}
                          thumb={csGame.info.thumb}
                          currentPrice={parseFloat(deal.price)}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-white/40">
                    <div className="text-2xl mb-2">📄</div>
                    <div className="text-sm">{t('game.no_active_deals')}</div>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="text-xs text-blue-300 font-medium flex gap-2 items-start">
                  <span>ℹ️</span>
                  <span>{t('game.redirect_info')}</span>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
  );
}