import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/entities/user/model/userStore";
import { CheapSharkApi } from "@/shared/api/cheapSharkApi";

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
    steamRatingPercent?: string;
    steamRatingText?: string;
    steamRatingCount?: string;
    metacriticScore?: string;
}

export interface SteamGenre {
    id: number;
    description: string;
}

export interface SteamScreenshot {
    id: number;
    path_thumbnail: string;
}

export interface SteamMetacritic {
    score: number;
    url: string;
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
    metacritic?: SteamMetacritic;
}

export interface SteamAppDetailsResult {
    success: boolean;
    data: SteamAppDetails;
}

export type SteamAppDetailsResponse = Record<string, SteamAppDetailsResult>;

export interface SteamReviewsSummary {
    num_reviews: number;
    review_score: number;
    review_score_desc: string;
    total_positive: number;
    total_negative: number;
    total_reviews: number;
}

// Vite dev-server proxies /api/steam -> https://store.steampowered.com/api
const STEAM_LOCAL_BASE = "/api/steam";
// Cloudflare Worker CORS proxy (production) — accepts ?url= parameter
const STEAM_CF_PROXY = import.meta.env.VITE_STEAM_CORS_PROXY || "https://steam-proxy.malikdjurabaev.workers.dev";

const isLocal = () =>
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

/** Build a proxied URL: local = Vite proxy path, prod = Cloudflare Worker */
const proxySteam = (steamUrl: string, localPath: string): string =>
    isLocal() ? localPath : `${STEAM_CF_PROXY}/?url=${encodeURIComponent(steamUrl)}`;

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
                const ccParam = countryCode ? `&cc=${countryCode.toLowerCase()}` : "";
                const steamUrl = `https://store.steampowered.com/api/appdetails?appids=${steamAppID}&l=russian${ccParam}`;
                const localPath = `${STEAM_LOCAL_BASE}/appdetails?appids=${steamAppID}&l=russian${ccParam}`;

                const res = await fetch(proxySteam(steamUrl, localPath));
                if (!res.ok) throw new Error(`Steam appdetails failed: ${res.status}`);
                const data = await res.json() as SteamAppDetailsResponse;
                return data[steamAppID as string]?.success ? data[steamAppID as string].data : null;
            } catch (error) {
                console.error("Ошибка при получении данных из Steam:", error);
                return null;
            }
        },
        enabled: Boolean(steamAppID),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });

    const steamReviewsQuery = useQuery({
        queryKey: ["steamReviews", steamAppID],
        queryFn: async () => {
            try {
                const steamUrl = `https://store.steampowered.com/appreviews/${steamAppID}?json=1`;
                const localPath = `/api/steam-reviews/${steamAppID}?json=1`;

                const res = await fetch(proxySteam(steamUrl, localPath));
                if (!res.ok) throw new Error(`Steam reviews failed: ${res.status}`);
                const data = await res.json();
                return data?.success ? (data.query_summary as SteamReviewsSummary) : null;
            } catch (error) {
                console.error("Ошибка при получении отзывов из Steam:", error);
                return null;
            }
        },
        enabled: Boolean(steamAppID),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });

    return {
        csGame: csQuery.data,
        steamDetails: steamQuery.data,
        steamReviews: steamReviewsQuery.data,
        isLoading: csQuery.isLoading || (Boolean(steamAppID) && steamQuery.isLoading),
        isError: csQuery.isError,
    };
}
