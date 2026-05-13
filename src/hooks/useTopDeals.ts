import { useQuery } from "@tanstack/react-query";
import { CheapSharkApi, type CheapSharkTopDeal } from "../services/cheapSharkApi";

export function useTopDeals(limit: number = 7) {
    return useQuery<CheapSharkTopDeal[]>({
        queryKey: ["topDeals", limit],
        queryFn: async () => {
            const deals = await CheapSharkApi.getTopDeals();
            
            // Фильтруем дубликаты игр, оставляя только лучшее предложение для каждой игры
            const uniqueDeals: CheapSharkTopDeal[] = [];
            const seenGames = new Set<string>();
            
            for (const deal of deals) {
                if (!seenGames.has(deal.gameID)) {
                    seenGames.add(deal.gameID);
                    uniqueDeals.push(deal);
                }
            }
            
            return uniqueDeals.slice(0, limit);
        },
        staleTime: 1000 * 60 * 15,
    });
}
