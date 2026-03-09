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
const CACHE_KEY = 'qf_last_search_cache';

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

        const fetchLiveDeals = async () => {
            setLoading(true);
            setApiStatus("online");

            try {
                const results: CheapSharkGame[] = await CheapSharkAPI.searchGames(searchQuery);

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

                    // СОХРАНЯЕМ В КЭШ: Если API ответил успешно, запоминаем эти игры!
                    localStorage.setItem(CACHE_KEY, JSON.stringify(formattedDeals));
                }
            } catch (error) {
                console.error("API упал, включаем фоллбэк:", error);
                if (isMounted) {
                    setApiStatus("fallback");

                    // ДОСТАЕМ ИЗ КЭША: Ищем сохраненные игры в localStorage
                    const cachedData = localStorage.getItem(CACHE_KEY);
                    if (cachedData) {
                        setDeals(JSON.parse(cachedData)); // Показываем старые данные
                    } else {
                        setDeals([]); // Если кэш пуст, тогда уж ничего не поделать
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