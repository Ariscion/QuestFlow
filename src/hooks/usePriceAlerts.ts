import { useQuery } from "@tanstack/react-query";
import { getPriceAlerts, type PriceAlert } from "../lib/firebase";

export function usePriceAlerts(uid: string | undefined) {
    return useQuery<PriceAlert[]>({
        queryKey: ["priceAlerts", uid],
        queryFn: async () => {
            if (!uid) return [];
            return await getPriceAlerts(uid);
        },
        enabled: Boolean(uid),
        staleTime: 1000 * 60 * 30, // 30 minutes cache
    });
}
