import { useState, useEffect } from 'react';
import { GAMES_DB, } from '../data/database';

const CACHE_KEY = "qf_steam_cache_v2";

export function useDeals(searchQuery: string = "") {
    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [apiStatus, setApiStatus] = useState<"online" | "cache" | "fallback">("online");

    async function fetchData() {
        setLoading(true);
        try {
            if (!navigator.onLine) throw new Error("Нет интернета");

            // 1. Фильтруем базу локально по поиску
            const filteredGames = GAMES_DB.filter(game =>
                game.title.toLowerCase().includes(searchQuery.toLowerCase())
            );

            // 2. Достаем ID только тех игр, которые есть в Steam
            const steamGames = filteredGames.filter(g => g.steamAppId !== null);

            // 3. Делаем запросы в Steam
            const steamPromises = steamGames.map(game =>
                fetch(`/api/steam/appdetails?appids=${game.steamAppId}&cc=kz`, { cache: 'no-store' })
                    .then(res => {
                        if (!res.ok) throw new Error(`Steam HTTP: ${res.status}`);
                        return res.json();
                    })
            );

            const steamResults = await Promise.all(steamPromises);

            // 4. Собираем финальный массив (склеиваем Steam данные + Epic цены из локальной БД)
            const combinedDeals = filteredGames.map((localGame) => {
                let steamPriceLabel = "Нет цены";
                let hasSteam = false;

                if (localGame.steamAppId) {
                    // Ищем ответ от Steam для этой игры
                    const steamData = steamResults.find(res => res[localGame.steamAppId!]);
                    const gameData = steamData?.[localGame.steamAppId!]?.data;

                    if (gameData) {
                        hasSteam = true;
                        // Если игра бесплатная (как CS2)
                        if (gameData.is_free) {
                            steamPriceLabel = "Бесплатно";
                        } else {
                            steamPriceLabel = gameData.price_overview?.final_formatted || "Нет цены";
                        }
                        // Можно обновлять картинку из стима, но мы оставим из БД для скорости
                    }
                }

                return {
                    id: localGame.id,
                    title: localGame.title,
                    image: localGame.image,
                    steamPrice: localGame.steamAppId === null ? "Эксклюзив Epic" : steamPriceLabel,
                    epicPrice: localGame.epicPrice === null ? "Эксклюзив Steam" : localGame.epicPrice,
                    isSteamExclusive: localGame.epicPrice === null,
                    isEpicExclusive: localGame.steamAppId === null
                };
            });

            if (combinedDeals.length === 0 && filteredGames.length > 0) throw new Error("Нет данных от Steam");

            localStorage.setItem(CACHE_KEY, JSON.stringify(combinedDeals));
            setDeals(combinedDeals);
            setApiStatus("online");
        } catch (error) {
            console.warn("Live API Error! Грузим кэш...", error);
            loadFromCache(searchQuery);
        } finally {
            setLoading(false);
        }
    }

    function loadFromCache(query: string) {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
            const parsed = JSON.parse(cachedData);
            // Фильтруем кэш по поиску
            const filtered = parsed.filter((g: any) => g.title.toLowerCase().includes(query.toLowerCase()));
            setDeals(filtered);
            setApiStatus("cache");
        } else {
            // Если совсем беда, отдаем БД как fallback
            const filtered = GAMES_DB.filter(g => g.title.toLowerCase().includes(query.toLowerCase()));
            const fallback = filtered.map(g => ({
                id: g.id,
                title: g.title,
                image: g.image,
                steamPrice: "Offline",
                epicPrice: g.epicPrice || "N/A"
            }));
            setDeals(fallback);
            setApiStatus("fallback");
        }
    }

    // Перезапускаем фетч, если изменился запрос поиска
    useEffect(() => {
        // Добавляем debounce (задержку), чтобы не спамить API при каждом нажатии клавиши
        const timeoutId = setTimeout(() => {
            fetchData();
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return { deals, loading, apiStatus, refetch: fetchData };
}