import { useState, useEffect } from 'react';
import { CheapSharkAPI, type CheapSharkGame } from '../services/cheapSharkApi';

// Интерфейс, который ожидает наш UI
export interface AppDeal {
    id: string;
    title: string;
    thumb: string;
    steamAppID: string | null;
    bestPriceKZT: number; // Лучшая цена в тенге
    bestPriceUSD: string; // Оригинальная цена
}

// Грубый курс для конвертации
const USD_TO_KZT = 450;

export function useDeals(searchQuery: string) {
    const [deals, setDeals] = useState<AppDeal[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [apiStatus, setApiStatus] = useState<"online" | "cache" | "fallback">("online");

    useEffect(() => {
        // Если поиск пустой, пока не ищем (или можно вывести дефолтные хиты)
        if (!searchQuery) {
            setDeals([]);
            return;
        }

        let isMounted = true; // Защита от race conditions в React

        const fetchLiveDeals = async () => {
            setLoading(true);
            setApiStatus("online");

            try {
                // Идем в РЕАЛЬНЫЙ интернет через наш сервис!
                const results: CheapSharkGame[] = await CheapSharkAPI.searchGames(searchQuery);

                if (isMounted) {
                    // Маппим данные из чужого API в удобный для нашего UI формат
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
                }
            } catch (error) {
                console.error("API упал, включаем фоллбэк:", error);
                if (isMounted) {
                    setApiStatus("fallback"); // Этика: честно говорим, что данные отвалились
                    setDeals([]); // Тут можно подгрузить старый кэш из localStorage
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        // Дебаунс (чтобы не спамить API на каждую букву)
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