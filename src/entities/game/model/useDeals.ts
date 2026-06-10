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
    const countryCode = useUserStore((s) => s.currencyInfo.countryCode);
    const currencyRates = useUserStore((s) => s.currencyRates);
    const localCurrencyCode = useUserStore((s) => s.currencyInfo.code);

    return useQuery({
        queryKey: ["deals", normalizedQuery, countryCode],
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
                
                const uniqueGames = Array.from(uniqueGamesMap.values()).map(deal => ({
                    gameID: deal.gameID,
                    external: deal.title,
                    thumb: deal.thumb,
                    steamAppID: deal.steamAppID,
                    cheapest: deal.salePrice,
                    steamRatingPercent: deal.steamRatingPercent && deal.steamRatingPercent !== "0" ? deal.steamRatingPercent : undefined,
                    steamRatingText: deal.steamRatingText && deal.steamRatingPercent !== "0" ? deal.steamRatingText : undefined,
                    steamRatingCount: deal.steamRatingCount && deal.steamRatingPercent !== "0" ? deal.steamRatingCount : undefined,
                    metacriticScore: deal.metacriticScore && deal.metacriticScore !== "0" ? deal.metacriticScore : undefined,
                    steamPriceOverview: null as any,
                }));

                const steamAppIDs = uniqueGames
                    .map(g => g.steamAppID)
                    .filter((id): id is string => Boolean(id));

                if (steamAppIDs.length > 0) {
                    try {
                        const ccParam = countryCode ? `&cc=${countryCode.toLowerCase()}` : "";
                        const steamUrl = `https://store.steampowered.com/api/appdetails?appids=${steamAppIDs.join(",")}&filters=price_overview${ccParam}`;
                        const localPath = `/api/steam/appdetails?appids=${steamAppIDs.join(",")}&filters=price_overview${ccParam}`;

                        const isLocal = () =>
                            window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
                        const proxyUrl = isLocal() 
                            ? localPath 
                            : `${import.meta.env.VITE_STEAM_CORS_PROXY || "https://steam-proxy.malikdjurabaev.workers.dev"}/?url=${encodeURIComponent(steamUrl)}`;

                        const steamRes = await fetch(proxyUrl);
                        if (steamRes.ok) {
                            const steamData = await steamRes.json();
                            for (const game of uniqueGames) {
                                if (game.steamAppID && steamData[game.steamAppID]?.success) {
                                    game.steamPriceOverview = steamData[game.steamAppID].data?.price_overview || null;
                                }
                            }
                        }
                    } catch (steamErr) {
                        console.error("Failed to fetch Steam regional prices in batch:", steamErr);
                    }
                }
                
                return uniqueGames;
            } catch (error) {
                console.error("Failed to fetch search deals:", error);
                return [];
            }
        },
        select: (data) => data.map(game => {
            const cheapestUSD = parseFloat(game.cheapest);
            let bestPriceLocal = Math.round(cheapestUSD * rateToUSD);
            let bestPriceUSD = game.cheapest;

            // Compare with Steam regional price if available
            if (game.steamPriceOverview) {
                const steamCurrency = game.steamPriceOverview.currency.toUpperCase();
                const steamPriceVal = game.steamPriceOverview.final / 100;

                let steamPriceLocal: number;
                if (steamCurrency === localCurrencyCode) {
                    steamPriceLocal = steamPriceVal;
                } else {
                    const steamRateToUSD = currencyRates[steamCurrency] || 1;
                    const priceInUSD = steamPriceVal / steamRateToUSD;
                    steamPriceLocal = Math.round(priceInUSD * rateToUSD);
                }

                if (steamPriceLocal < bestPriceLocal) {
                    bestPriceLocal = Math.round(steamPriceLocal);
                    const localRateToUSD = rateToUSD || 1;
                    bestPriceUSD = (steamPriceLocal / localRateToUSD).toFixed(2);
                }
            }

            return {
                id: game.gameID,
                title: game.external,
                thumb: game.thumb,
                steamAppID: game.steamAppID,
                bestPriceUSD: bestPriceUSD,
                bestPriceLocal: bestPriceLocal,
                currency: symbol || 'USD',
                steamRatingPercent: game.steamRatingPercent,
                steamRatingText: game.steamRatingText,
                steamRatingCount: game.steamRatingCount,
                metacriticScore: game.metacriticScore,
            };
        }),
        enabled: Boolean(normalizedQuery),
        staleTime: 1000 * 60 * 15,
    });
}