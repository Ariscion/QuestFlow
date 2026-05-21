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
    const rateToUSD = useUserStore((s) => s.currencyInfo.rateToUSD);
    const symbol = useUserStore((s) => s.currencyInfo.symbol);

    return useQuery({
        // rateToUSD removed — CheapShark always returns USD, conversion is in `select`
        queryKey: ["deals", normalizedQuery],
        queryFn: async () => {
            if (!normalizedQuery) return [];
            return await CheapSharkApi.searchGames(normalizedQuery);
        },
        // `select` runs reactively on cached data — no new HTTP request when currency changes
        select: (data) => data.map(game => ({
            id: game.gameID,
            title: game.external,
            thumb: game.thumb,
            steamAppID: game.steamAppID,
            bestPriceUSD: game.cheapest,
            bestPriceLocal: Math.round(parseFloat(game.cheapest) * rateToUSD),
            currency: symbol || 'USD',
        })),
        enabled: Boolean(normalizedQuery),
        staleTime: 1000 * 60 * 15,
    });
}