import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, Panel, Pill } from "@/shared/ui/Primitives";
import { GameCover } from "@/entities/game/ui/GameCover";
import { useUserStore } from "@/entities/user/model/userStore";



export default function Library() {
    const { t } = useTranslation();
    const { library, wishlist, user, userLevel, userXP, xpToNextLevel, currencyInfo, removeGame, toggleWishlist } = useUserStore();

    const getPlatformBadge = (store?: string) => {
        if (!store) return t('library.platform.synced');
        const normalized = store.toLowerCase();
        if (normalized.includes("steam")) return "Steam";
        if (normalized.includes("epic")) return "Epic Games";
        if (normalized.includes("gog")) return "GOG";
        return store;
    };
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"library" | "wishlist">("library");

    const xpPercentage = Math.min(100, Math.round((userXP / xpToNextLevel) * 100));

    let totalRetailLocal = 0;
    let totalPurchasedLocal = 0;

    library.forEach(game => {
        const retailUSD = parseFloat(game.epicPrice) || 0;
        const saleUSD = parseFloat(game.steamPrice) || 0;
        
        totalRetailLocal += Math.round(retailUSD * currencyInfo.rateToUSD);
        totalPurchasedLocal += Math.round(saleUSD * currencyInfo.rateToUSD);
    });

    const totalSavedLocal = totalRetailLocal - totalPurchasedLocal;

    const displayedGames = activeTab === "library" ? library : (wishlist || []);

    return (
        <div className="h-full flex flex-col gap-5 overflow-hidden">
            <div className="flex flex-col xl:flex-row gap-5 shrink-0">
                {/* ПРОФИЛЬ И ОПЫТ */}
                <Panel className="p-6 flex-1 border-slate-800 bg-slate-900 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className="w-16 h-16 relative rounded-full bg-slate-950 flex items-center justify-center border-2 border-slate-800">
                                    <span className="text-2xl font-black text-blue-400">{userLevel}</span>
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-blue-600 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded text-white shadow-sm">Lvl</div>
                            </div>
                            <div className="text-center sm:text-left">
                                <div className="text-lg font-black text-white drop-shadow-md">{user?.name ?? t('library.profile.default_name')}</div>
                                <div className="text-xs text-blue-300/80 font-medium mt-0.5">{t('library.profile.role')}</div>
                            </div>
                        </div>

                        <div className="flex-1 w-full mt-2 sm:mt-0 max-w-md mx-auto sm:ml-auto">
                            <div className="flex justify-between text-xs text-white/70 mb-2 font-bold tracking-wide">
                                <span className="text-cyan-300 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">{userXP} XP</span>
                                <span>{xpToNextLevel} XP</span>
                            </div>
                            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${xpPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </Panel>

                {/* СТАТИСТИКА БИБЛИОТЕКИ */}
                <Panel className="p-6 xl:w-[400px] border-slate-800 bg-slate-900 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <div className="text-xs text-emerald-400/80 uppercase tracking-wider mb-1 font-bold">{t('library.stats.saved')}</div>
                            <div className="text-2xl font-black text-emerald-400">
                                {totalSavedLocal.toLocaleString('ru-RU')} {currencyInfo.symbol}
                            </div>
                            <div className="text-[10px] text-white/40 mt-1">{t('library.stats.real_cost')} <span className="line-through">{totalRetailLocal.toLocaleString('ru-RU')} {currencyInfo.symbol}</span></div>
                        </div>
                        <div className="h-12 w-px bg-white/10" />
                        <div className="text-right">
                            <div className="text-xs text-blue-400/80 uppercase tracking-wider mb-1 font-bold">{t('library.stats.in_library')}</div>
                            <div className="text-3xl font-black text-white">
                                {library.length} <span className="text-sm font-normal text-white/50">{t('library.stats.games')}</span>
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>

            <Panel className="p-6 flex-1 overflow-y-auto relative bg-slate-900/40 border border-slate-800/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
                    <div className="flex gap-6">
                        <button 
                            onClick={() => setActiveTab("library")}
                            className={`text-lg font-bold transition-colors ${activeTab === "library" ? "text-white/90" : "text-white/40 hover:text-white/70"}`}
                        >
                            {t('library.tabs.my_games')}
                        </button>
                        <button 
                            onClick={() => setActiveTab("wishlist")}
                            className={`text-lg font-bold transition-colors flex items-center gap-2 ${activeTab === "wishlist" ? "text-rose-400" : "text-white/40 hover:text-white/70"}`}
                        >
                            {t('library.tabs.wishlist')}
                            {wishlist?.length > 0 && (
                                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-full">{wishlist.length}</span>
                            )}
                        </button>
                    </div>
                    <Pill className="self-start sm:self-auto bg-slate-950 border-slate-800 text-slate-300">
                        {activeTab === "library" ? t('library.stats.games_count', { count: library.length }) : t('library.stats.wishlist_count', { count: wishlist?.length || 0 })}
                    </Pill>
                </div>

                {displayedGames.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center border border-slate-800 rounded-2xl bg-slate-950/40 px-6">
                        <div className="text-4xl mb-4 opacity-50">{activeTab === "library" ? "🎮" : "🤍"}</div>
                        <div className="text-lg font-medium text-white/70 mb-2">
                            {activeTab === "library" ? t('library.empty.library') : t('library.empty.wishlist')}
                        </div>
                        <div className="text-sm text-white/40 max-w-md">
                            {activeTab === "library" 
                                ? t('library.empty.library_desc')
                                : t('library.empty.wishlist_desc')}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {displayedGames.map((game, index) => (
                            <div
                                key={`${game.id}-${index}`}
                                className="relative group cursor-pointer"
                                onClick={() => navigate(`/game/${game.id}`)}
                            >
                                <Card className="p-4 flex flex-col gap-4 bg-slate-950/20 hover:bg-slate-950/50 border border-slate-800/60 hover:border-slate-700 transition-all h-full">
                                    <button
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            if (activeTab === "library") removeGame(game.id);
                                            else toggleWishlist(game);
                                        }}
                                        className="absolute top-6 right-6 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center border border-white/10 hover:border-red-400"
                                        title={activeTab === "library" ? t('library.actions.remove_library') : t('library.actions.remove_wishlist')}
                                    >
                                        ✕
                                    </button>
                                    <GameCover
                                        src={game.image}
                                        alt={game.title}
                                        className="w-full h-32 sm:h-40 rounded-xl shadow-inner opacity-90 group-hover:opacity-100 transition-opacity"
                                    />

                                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mt-auto">
                                        <h3 className="text-base font-bold text-white leading-tight group-hover:text-blue-200 transition-colors">{game.title}</h3>
                                        <Pill className="shrink-0 bg-emerald-500/15 text-emerald-300 border-emerald-400/20 text-[10px] sm:text-xs">
                                            {getPlatformBadge(game.purchasedStore)}
                                        </Pill>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </Panel>
        </div>
    );
}