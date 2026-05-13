import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { CheapSharkApi } from '../services/cheapSharkApi';
import { useToastStore } from '../store/toastStore';
import { useTranslation } from "react-i18next";

export function useWishlistCheck() {
    const { wishlist } = useUserStore();
    const addToast = useToastStore(s => s.addToast);
    const { t } = useTranslation();
    
    useEffect(() => {
        if (!wishlist || wishlist.length === 0) return;
        
        const lastCheck = localStorage.getItem('qf_last_wishlist_check');
        const now = Date.now();
        
        // Проверяем раз в сутки (24 часа)
        if (lastCheck && now - parseInt(lastCheck) < 24 * 60 * 60 * 1000) {
            return;
        }
        
        const checkDiscounts = async () => {
            try {
                // CheapShark позволяет до 25 игр в одном запросе
                // Но мы для простоты берем все (вряд ли в избранном будет 100+ игр, а если будет, можно разбить на чанки)
                const gameIds = wishlist.map(g => g.id);
                // Разобьем на чанки по 25 игр
                const chunkSize = 25;
                let discountedGamesCount = 0;
                let firstDiscountedGameName = '';

                for (let i = 0; i < gameIds.length; i += chunkSize) {
                    const chunk = gameIds.slice(i, i + chunkSize);
                    const liveData = await CheapSharkApi.getMultipleGames(chunk);
                    
                    for (const game of wishlist.filter(g => chunk.includes(g.id))) {
                        const data = liveData[game.id];
                        if (!data || !data.deals || data.deals.length === 0) continue;
                        
                        const bestDeal = data.deals[0];
                        const currentBestPrice = parseFloat(bestDeal.price);
                        const retailPrice = parseFloat(bestDeal.retailPrice || "0");
                        
                        // Уведомляем, если игра сейчас продается со скидкой (текущая цена ниже полной)
                        if (currentBestPrice < retailPrice) {
                            discountedGamesCount++;
                            if (!firstDiscountedGameName) {
                                firstDiscountedGameName = game.title;
                            }
                        }
                    }
                }
                
                if (discountedGamesCount > 0) {
                    addToast({
                        title: t('notifications.wishlist_discounts_title'),
                        message: discountedGamesCount === 1 
                            ? t('notifications.wishlist_discount_single', { name: firstDiscountedGameName }) 
                            : t('notifications.wishlist_discount_multiple', { name: firstDiscountedGameName, count: discountedGamesCount - 1 }),
                        type: "info",
                        duration: 8000
                    });
                }
                
                localStorage.setItem('qf_last_wishlist_check', now.toString());
            } catch (err) {
                console.error("Ошибка при проверке избранного:", err);
            }
        };
        
        checkDiscounts();
    }, [wishlist, addToast]);
}
