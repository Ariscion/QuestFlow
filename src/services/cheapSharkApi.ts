// Базовый URL для всех запросов к CheapShark
const BASE_URL = 'https://www.cheapshark.com/api/1.0';

// Типизация того, что нам возвращает поиск API
export interface CheapSharkGame {
    gameID: string;
    steamAppID: string | null;
    cheapest: string; // Самая низкая цена прямо сейчас (в баксах)
    cheapestDealID: string;
    external: string; // Название игры
    thumb: string;    // Обложка игры
}

// Типизация конкретной скидки в конкретном магазине
export interface CheapSharkDeal {
    storeID: string;
    dealID: string;
    price: string;
    retailPrice: string;
    savings: string; // Процент скидки
}

// Хардкодим основные магазины для быстрого маппинга (по ID из CheapShark)
// Полный список можно получить по /stores, но нам для MVP хватит этих:
export const STORE_NAMES: Record<string, string> = {
    "1": "Steam",
    "2": "GamersGate",
    "3": "GreenManGaming",
    "7": "GOG",
    "8": "Origin",
    "11": "Humble Store",
    "25": "Epic Games Store"
};

export const CheapSharkAPI = {
    /**
     * Поиск игр по названию
     * @param query Строка поиска (например, "batman")
     * @returns Массив найденных игр
     */
    searchGames: async (query: string): Promise<CheapSharkGame[]> => {
        if (!query.trim()) return [];

        // Убрали try-catch, чтобы ошибка летела прямо в хук и включала желтую плашку!
        const response = await fetch(`${BASE_URL}/games?title=${encodeURIComponent(query)}&limit=15`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    /**
     * Получение всех предложений (скидок) по конкретной игре во ВСЕХ магазинах
     * @param gameId ID игры в системе CheapShark
     */
    getGameDeals: async (gameId: string) => {
        try {
            const response = await fetch(`${BASE_URL}/games?id=${gameId}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return data.deals as CheapSharkDeal[];
        } catch (error) {
            console.error("Ошибка получения скидок:", error);
            return [];
        }
    }
};