import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "../store/userStore";
import { CheapSharkApi } from "../services/cheapSharkApi";

export interface CheapSharkGameDeal {
    dealID: string;
    storeID: string;
    price: string;
    retailPrice: string;
    savings: string;
}

export interface CheapSharkGameInfo {
    title: string;
    steamAppID: string | null;
    thumb: string;
}

export interface CheapSharkGameDetails {
    info: CheapSharkGameInfo;
    deals: CheapSharkGameDeal[];
    cheapestPriceEver?: {
        price: string;
    };
}

export interface SteamGenre {
    id: number;
    description: string;
}

export interface SteamScreenshot {
    id: number;
    path_thumbnail: string;
}

export interface SteamAppDetails {
    short_description?: string;
    background?: string;
    genres?: SteamGenre[];
    screenshots?: SteamScreenshot[];
    price_overview?: {
        currency: string;
        initial: number;
        final: number;
        discount_percent: number;
        initial_formatted: string;
        final_formatted: string;
    };
}

export interface SteamAppDetailsResult {
    success: boolean;
    data: SteamAppDetails;
}

export type SteamAppDetailsResponse = Record<string, SteamAppDetailsResult>;

// Vite dev-server proxies /api/steam -> https://store.steampowered.com/api
const STEAM_BASE = import.meta.env.VITE_STEAM_PROXY_URL || "/api/steam";

export function useGameDetails(id: string | undefined) {
    const { countryCode } = useUserStore((s) => s.currencyInfo);

    const csQuery = useQuery({
        queryKey: ["cheapSharkGame", id],
        queryFn: async () => {
            if (!id) throw new Error("No ID provided");
            return await CheapSharkApi.getGameDetails(id);
        },
        enabled: Boolean(id),
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    const steamAppID = csQuery.data?.info?.steamAppID;

    const steamQuery = useQuery({
        queryKey: ["steamDetails", steamAppID, countryCode],
        queryFn: async () => {
            try {
                const ccParam = countryCode ? `&cc=${countryCode.toLowerCase()}` : '';
                const steamUrl = `https://store.steampowered.com/api/appdetails?appids=${steamAppID}&l=russian${ccParam}`;
                
                // Проверяем, где мы запущены. На проде (Firebase) прокси Vite не работает.
                // Так как функции требуют Blaze плана, используем публичный CORS прокси Codetabs
                const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                
                if (isLocal) {
                    const res = await fetch(`${STEAM_BASE}/appdetails?appids=${steamAppID}&l=russian${ccParam}`);
                    if (!res.ok) throw new Error("Steam response was not ok");
                    const data = await res.json() as SteamAppDetailsResponse;
                    return data[steamAppID as string]?.success ? data[steamAppID as string].data : null;
                } else {
                    // Codetabs требует полной кодировки URL, чтобы передать все параметры (включая cc)
                    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(steamUrl)}`;
                    const proxyRes = await fetch(proxyUrl);
                    if (!proxyRes.ok) throw new Error("Proxy response was not ok");
                    const data = await proxyRes.json() as SteamAppDetailsResponse;
                    return data[steamAppID as string]?.success ? data[steamAppID as string].data : null;
                }
            } catch (error) {
                console.error("Ошибка при получении данных из Steam:", error);
                return null;
            }
        },
        enabled: Boolean(steamAppID) && countryCode !== 'RU',
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });

    return {
        csGame: csQuery.data,
        steamDetails: steamQuery.data,
        isLoading: csQuery.isLoading || (Boolean(steamAppID) && steamQuery.isLoading),
        isError: csQuery.isError,
    };
}
