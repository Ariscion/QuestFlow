import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/entities/user/model/userStore";

export interface AppDeal {
    id: string;
    title: string;
    thumb: string;
    steamAppID: string | null;
    bestPriceLocal: number;
    bestPriceUSD: string;
    currency: string;
    steamRatingPercent?: string;
    steamRatingText?: string;
    steamRatingCount?: string;
    metacriticScore?: string;
}

export function useDeals(searchQuery: string) {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const rateToUSD = useUserStore((s) => s.currencyInfo.rateToUSD);
    const symbol = useUserStore((s) => s.currencyInfo.symbol);

    return useQuery({
        queryKey: ["deals", normalizedQuery],
        queryFn: async () => {
            if (!normalizedQuery) return [];
            try {
                const res = await fetch(`https://www.cheapshark.com/api/1.0/deals?title=${encodeURIComponent(normalizedQuery)}&pageSize=60`);
                if (!res.ok) throw new Error("Failed to fetch search deals");
                const deals = await res.json();
                
                // Deduplicate by gameID, keeping the one with the lowest salePrice
                const uniqueGamesMap = new Map<string, any>();
                for (const deal of deals) {
                    const existing = uniqueGamesMap.get(deal.gameID);
                    if (!existing || parseFloat(deal.salePrice) < parseFloat(existing.salePrice)) {
                        uniqueGamesMap.set(deal.gameID, deal);
                    }
                }
                
                return Array.from(uniqueGamesMap.values()).map(deal => ({
                    gameID: deal.gameID,
                    external: deal.title,
                    thumb: deal.thumb,
                    steamAppID: deal.steamAppID,
                    cheapest: deal.salePrice,
                    steamRatingPercent: deal.steamRatingPercent && deal.steamRatingPercent !== "0" ? deal.steamRatingPercent : undefined,
                    steamRatingText: deal.steamRatingText && deal.steamRatingPercent !== "0" ? deal.steamRatingText : undefined,
                    steamRatingCount: deal.steamRatingCount && deal.steamRatingPercent !== "0" ? deal.steamRatingCount : undefined,
                    metacriticScore: deal.metacriticScore && deal.metacriticScore !== "0" ? deal.metacriticScore : undefined,
                }));
            } catch (error) {
                console.error("Failed to fetch search deals:", error);
                return [];
            }
        },
        select: (data) => data.map(game => ({
            id: game.gameID,
            title: game.external,
            thumb: game.thumb,
            steamAppID: game.steamAppID,
            bestPriceUSD: game.cheapest,
            bestPriceLocal: Math.round(parseFloat(game.cheapest) * rateToUSD),
            currency: symbol || 'USD',
            steamRatingPercent: game.steamRatingPercent,
            steamRatingText: game.steamRatingText,
            steamRatingCount: game.steamRatingCount,
            metacriticScore: game.metacriticScore,
        })),
        enabled: Boolean(normalizedQuery),
        staleTime: 1000 * 60 * 15,
    });
}