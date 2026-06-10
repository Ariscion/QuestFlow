const CS_BASE = "https://www.cheapshark.com/api/1.0";

export interface CheapSharkTopDeal {
    title: string;
    dealID: string;
    storeID: string;
    storeName: string;
    gameID: string;
    salePrice: string;
    normalPrice: string;
    savings: string;
    thumb: string;
    steamAppID: string | null;
    dealRating: string;
    currency: string;
    steamRatingPercent?: string;
    steamRatingText?: string;
    steamRatingCount?: string;
    metacriticScore?: string;
}

export interface CheapSharkGame {
    gameID: string;
    steamAppID: string | null;
    cheapest: string;
    cheapestDealID: string;
    external: string;
    thumb: string;
    currency: string;
}

export interface CheapSharkGameDetails {
    info: {
        title: string;
        steamAppID: string | null;
        thumb: string;
    };
    deals: {
        dealID: string;
        storeID: string;
        price: string;
        retailPrice: string;
        savings: string;
    }[];
    steamRatingPercent?: string;
    steamRatingText?: string;
    steamRatingCount?: string;
    metacriticScore?: string;
}

export interface RawCheapSharkGame {
    gameID: string;
    steamAppID: string | null;
    cheapest: string;
    cheapestDealID: string;
    external: string;
    thumb: string;
}

export interface RawCheapSharkTopDeal {
    title: string;
    dealID: string;
    storeID: string;
    gameID: string;
    salePrice: string;
    normalPrice: string;
    savings: string;
    thumb: string;
    steamAppID: string | null;
    dealRating: string;
    steamRatingPercent?: string;
    steamRatingText?: string;
    steamRatingCount?: string;
    metacriticScore?: string;
}

// CheapShark Store IDs
export const STORE_NAMES: Record<string, string> = {
    "1": "Steam",
    "2": "GamersGate",
    "3": "GreenManGaming",
    "7": "GOG",
    "11": "Humble Store",
    "15": "Fanatical",
    "21": "WinGameStore",
    "25": "Epic Games",
    "27": "Gamesplanet",
};

// Base method for requests to avoid duplication and handle timeouts
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const signal = options.signal;
    if (signal) {
        signal.addEventListener('abort', () => controller.abort());
    }

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

export const CheapSharkApi = {
    searchGames: async (query: string, signal?: AbortSignal): Promise<CheapSharkGame[]> => {
        if (!query.trim()) return [];
        try {
            const data = await fetchWithTimeout(`${CS_BASE}/games?title=${encodeURIComponent(query)}`, { signal });
            
            return data.map((game: RawCheapSharkGame) => ({
                gameID: game.gameID,
                steamAppID: game.steamAppID,
                cheapest: game.cheapest,
                cheapestDealID: game.cheapestDealID,
                external: game.external,
                thumb: game.thumb,
                currency: "USD",
            }));
        } catch (error) {
            if ((error as Error).name === 'AbortError') {
                console.log("Search request aborted");
                return [];
            }
            console.error("CheapShark searchGames error:", error);
            return [];
        }
    },

    getTopDeals: async (signal?: AbortSignal): Promise<CheapSharkTopDeal[]> => {
        try {
            const data = await fetchWithTimeout(`${CS_BASE}/deals?pageSize=50`, { signal });
            
            return data.map((deal: RawCheapSharkTopDeal) => ({
                title: deal.title,
                dealID: deal.dealID,
                storeID: deal.storeID,
                storeName: STORE_NAMES[deal.storeID] || `Store ${deal.storeID}`,
                gameID: deal.gameID,
                salePrice: deal.salePrice,
                normalPrice: deal.normalPrice,
                savings: deal.savings,
                thumb: deal.thumb,
                steamAppID: deal.steamAppID,
                dealRating: deal.dealRating,
                currency: "USD",
                steamRatingPercent: deal.steamRatingPercent,
                steamRatingText: deal.steamRatingText,
                steamRatingCount: deal.steamRatingCount,
                metacriticScore: deal.metacriticScore,
            }));
        } catch (error) {
            if ((error as Error).name === 'AbortError') return [];
            console.error("CheapShark getTopDeals error:", error);
            return [];
        }
    },

    getGameDetails: async (id: string, signal?: AbortSignal): Promise<CheapSharkGameDetails> => {
        try {
            const data = await fetchWithTimeout(`${CS_BASE}/games?id=${id}`, { signal });
            return data;
        } catch (error) {
            if ((error as Error).name === 'AbortError') throw error;
            console.error("CheapShark getGameDetails error:", error);
            throw error;
        }
    },

    getMultipleGames: async (ids: string[], signal?: AbortSignal): Promise<Record<string, CheapSharkGameDetails>> => {
        if (!ids.length) return {};
        try {
            const data = await fetchWithTimeout(`${CS_BASE}/games?ids=${ids.join(',')}`, { signal });
            return data;
        } catch (error) {
            if ((error as Error).name === 'AbortError') return {};
            console.error("CheapShark getMultipleGames error:", error);
            return {};
        }
    }
};
