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

const USD_TO_KZT = 450;
// Ключ для нашего хранилища в браузере
const CACHE_KEY = 'qf_search_cache_v2';

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

                    // СОХРАНЯЕМ В УМНЫЙ КЭШ:
                    // 1. Достаем старый словарь всех поисков
                    const existingCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
                    // 2. Записываем новый результат именно под ЭТИМ словом
                    existingCache[normalizedQuery] = formattedDeals;
                    // 3. Сохраняем обратно в хранилище
                    localStorage.setItem(CACHE_KEY, JSON.stringify(existingCache));
                }
            } catch (error) {
                console.error("API упал, включаем фоллбэк:", error);
                if (isMounted) {
                    setApiStatus("fallback");

                    // ДОСТАЕМ ИЗ УМНОГО КЭША:
                    const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
                    const savedDealsForThisQuery = cachedData[normalizedQuery];

                    if (savedDealsForThisQuery && savedDealsForThisQuery.length > 0) {
                        setDeals(savedDealsForThisQuery); // Нашли в кэше именно эту игру!
                    } else {
                        setDeals([]); // В кэше нет такого запроса
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