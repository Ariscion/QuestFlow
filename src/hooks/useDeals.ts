import { useState, useEffect } from 'react';
import { CheapSharkAPI } from '../services/cheapSharkApi';
import type { CheapSharkGame } from '../services/cheapSharkApi';

export interface AppDeal {
    id: string;
    title: string;
    thumb: string;
    steamAppID: string | null;
    bestPriceKZT: number;
    bestPriceUSD: string;
}

type DealsCache = Record<string, AppDeal[]>;

const USD_TO_KZT = 450;
const CACHE_KEY = 'qf_search_cache_v2';

function readDealsCache(): DealsCache {
    try {
        const rawCache = localStorage.getItem(CACHE_KEY);
        return rawCache ? (JSON.parse(rawCache) as DealsCache) : {};
    } catch {
        return {};
    }
}

export function useDeals(searchQuery: string) {
    const [deals, setDeals] = useState<AppDeal[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [apiStatus, setApiStatus] = useState<"online" | "cache" | "fallback">("online");

    useEffect(() => {
        if (!searchQuery) {
            setDeals([]);
            return;
        }

        let isMounted = true;
        const normalizedQuery = searchQuery.toLowerCase().trim();

        const fetchLiveDeals = async () => {
            setLoading(true);
            setApiStatus("online");

            try {
                const results: CheapSharkGame[] = await CheapSharkAPI.searchGames(normalizedQuery);

                if (isMounted) {
                    const formattedDeals: AppDeal[] = results.map(game => {
                        const usdPrice = parseFloat(game.cheapest);
                        const kztPrice = Math.round(usdPrice * USD_TO_KZT);

                        return {
                            id: game.gameID,
                            title: game.external,
                            thumb: game.thumb,
                            steamAppID: game.steamAppID,
                            bestPriceUSD: game.cheapest,
                            bestPriceKZT: kztPrice
                        };
                    });

                    setDeals(formattedDeals);

                    const existingCache = readDealsCache();
                    existingCache[normalizedQuery] = formattedDeals;
                    localStorage.setItem(CACHE_KEY, JSON.stringify(existingCache));
                }
            } catch (error) {
                console.error("API упал, включаем фоллбэк:", error);
                if (isMounted) {
                    setApiStatus("fallback");

                    const cachedData = readDealsCache();

                    let allCachedGames: AppDeal[] = [];
                    Object.values(cachedData).forEach((gamesArray) => {
                        allCachedGames = [...allCachedGames, ...gamesArray];
                    });

                    // Убираем дубликаты
                    const uniqueCachedGames = Array.from(new Map(allCachedGames.map(item => [item.id, item])).values());

                    // Фильтруем по частичному совпадению
                    const matchedGames = uniqueCachedGames.filter(game =>
                        game.title.toLowerCase().includes(normalizedQuery)
                    );

                    if (matchedGames.length > 0) {
                        setDeals(matchedGames);
                    } else {
                        setDeals([]);
                    }
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchLiveDeals();
        }, 500);

        return () => {
            clearTimeout(delayDebounceFn);
            isMounted = false;
        };
    }, [searchQuery]);

    return { deals, loading, apiStatus };
}