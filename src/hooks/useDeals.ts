import { useQuery } from "@tanstack/react-query";
import { CheapSharkApi } from "../services/cheapSharkApi";
import { useUserStore } from "../store/userStore";

export interface AppDeal {
    id: string;
    title: string;
    thumb: string;
    steamAppID: string | null;
    bestPriceLocal: number;
    bestPriceUSD: string;
    currency: string;
}

export function useDeals(searchQuery: string) {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const { rateToUSD, symbol } = useUserStore((s) => s.currencyInfo);

    return useQuery({
        queryKey: ["deals", normalizedQuery, rateToUSD],
        queryFn: async () => {
            if (!normalizedQuery) return [];
            
            const results = await CheapSharkApi.searchGames(normalizedQuery);
            
            return results.map(game => {
                const usdPrice = parseFloat(game.cheapest);
                const localPrice = Math.round(usdPrice * rateToUSD);

                return {
                    id: game.gameID,
                    title: game.external,
                    thumb: game.thumb,
                    steamAppID: game.steamAppID,
                    bestPriceUSD: game.cheapest,
                    bestPriceLocal: localPrice,
                    currency: symbol || 'USD',
                };
            });
        },
        enabled: Boolean(normalizedQuery),
        staleTime: 1000 * 60 * 15,
    });
}