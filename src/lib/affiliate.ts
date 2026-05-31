/**
 * CheapShark Affiliate Configuration
 *
 * To activate affiliate earnings:
 * 1. Register at https://www.cheapshark.com/affiliates
 * 2. Set VITE_CHEAPSHARK_AFFILIATE_ID in your .env file
 *
 * Without an ID, links still work — just without revenue attribution.
 */
const AFFILIATE_ID = import.meta.env.VITE_CHEAPSHARK_AFFILIATE_ID ?? "";

/**
 * Builds a CheapShark redirect URL for a given dealID.
 * Automatically appends the affiliate RID if configured.
 *
 * @param dealID - The CheapShark dealID string
 * @returns Full redirect URL to the store
 */
export function getDealUrl(dealID: string): string {
    let rawDealID = dealID;
    try {
        if (dealID.includes("%")) {
            rawDealID = decodeURIComponent(dealID);
        }
    } catch (e) {
        console.error(e);
    }
    const base = `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(rawDealID)}`;
    return AFFILIATE_ID ? `${base}&affid=${AFFILIATE_ID}` : base;
}

/**
 * Type guard: checks if a string is already a full URL (ITAD-style direct link)
 * vs. a CheapShark dealID string.
 */
export function isDirectUrl(dealIDOrUrl: string): boolean {
    return dealIDOrUrl.startsWith("http");
}

/**
 * Resolves either a direct URL or a CheapShark dealID into a final store URL.
 * Use this as the single source of truth for all outbound store redirects.
 */
export function resolveStoreUrl(dealIDOrUrl: string): string {
    if (isDirectUrl(dealIDOrUrl)) {
        return dealIDOrUrl;
    }
    return getDealUrl(dealIDOrUrl);
}
