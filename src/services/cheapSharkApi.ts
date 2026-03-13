// Базовый URL для всех запросов к CheapShark
const BASE_URL = 'https://www.cheapshark.com/api/1.0';

export interface CheapSharkGame {
    gameID: string;
    steamAppID: string | null;
    cheapest: string;
    cheapestDealID: string;
    external: string;
    thumb: string;
}

// НОВЫЙ ИНТЕРФЕЙС ДЛЯ СКИДОК ДНЯ
export interface CheapSharkTopDeal {
    title: string;
    dealID: string;
    storeID: string;
    gameID: string;
    salePrice: string;
    normalPrice: string;
    savings: string;
    thumb: string;
    steamAppID: string | null;
    dealRating: string; // Рейтинг выгодности сделки (от 0 до 10)
}

export const STORE_NAMES: Record<string, string> = {
    "1": "Steam",
    "7": "GOG",
    "8": "EA App",
    "11": "Humble Store",
    "13": "Ubisoft",
    "25": "Epic Games",
    "31": "Battle.net"
};

export const CheapSharkAPI = {
    searchGames: async (query: string): Promise<CheapSharkGame[]> => {
        if (!query.trim()) return [];
        const response = await fetch(`${BASE_URL}/games?title=${encodeURIComponent(query)}&limit=15`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    // НОВЫЙ МЕТОД: Получаем самые выгодные скидки прямо сейчас
    getTopDeals: async (): Promise<CheapSharkTopDeal[]> => {
        // sortBy=DealRating - сортирует по крутости скидки (например, скидка 90% будет первой)
        // onSale=1 - только игры со скидкой
        // storeID=1 - для MVP берем только Steam (чтобы были красивые карточки), потом можно убрать
        const response = await fetch(`${BASE_URL}/deals?storeID=1&sortBy=DealRating&onSale=1&upperPrice=15`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    }
};