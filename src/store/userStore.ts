import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Game {
    id: string;
    title: string;
    image: string;
    steamPrice: string;
    epicPrice: string;
    purchasedAt?: string;
    purchasedPrice?: string; // Добавили поле для сохранения цены покупки
    purchasedStore?: string; // Добавили поле для сохранения платформы
}

interface UserState {
    userLevel: number;
    userXP: number;
    xpToNextLevel: number;
    balanceKZT: number;
    library: Game[];
    buyGame: (gameData: Game, purchasedPrice: string, storeName: string) => boolean;
    addClickXP: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            // --- ДАННЫЕ ПРОФИЛЯ ---
            userLevel: 1,
            userXP: 0,
            xpToNextLevel: 1000,
            balanceKZT: 15000, // Твои 15к тенге

            // --- БИБЛИОТЕКА ИГР ---
            library: [],

            // --- МЕТОДЫ (ACTIONS) ---
            buyGame: (gameData, purchasedPrice, storeName) => {
                const { library, balanceKZT } = get();

                // Проверка: есть ли игра в библиотеке
                if (library.find(g => g.id === gameData.id)) {
                    console.warn('Игра уже в библиотеке!');
                    return false;
                }

                // ИСПРАВЛЕНИЕ: Парсим ИМЕННО ТУ цену, по которой кликнул юзер
                const priceValue = parseInt(purchasedPrice.replace(/\D/g, '') || '0', 10);

                if (balanceKZT < priceValue) {
                    alert('Недостаточно средств на балансе QuestFlow!');
                    return false;
                }

                // Списываем деньги, добавляем игру с указанием магазина и цены
                set((state) => {
                    const newXP = state.userXP + 150;
                    const isLevelUp = newXP >= state.xpToNextLevel;

                    return {
                        library: [
                            ...state.library,
                            {
                                ...gameData,
                                purchasedAt: new Date().toISOString(),
                                purchasedPrice: purchasedPrice, // Сохраняем за сколько купили
                                purchasedStore: storeName       // Сохраняем где купили
                            }
                        ],
                        balanceKZT: state.balanceKZT - priceValue,
                        userXP: isLevelUp ? (newXP - state.xpToNextLevel) : newXP,
                        userLevel: isLevelUp ? state.userLevel + 1 : state.userLevel,
                        xpToNextLevel: isLevelUp ? Math.floor(state.xpToNextLevel * 1.5) : state.xpToNextLevel
                    };
                });

                return true;
            },

            addClickXP: () => set((state) => {
                const newXP = state.userXP + 10;
                if (newXP >= state.xpToNextLevel) {
                    return {
                        userXP: newXP - state.xpToNextLevel,
                        userLevel: state.userLevel + 1,
                        xpToNextLevel: Math.floor(state.xpToNextLevel * 1.5)
                    }
                }
                return { userXP: newXP };
            })
        }),
        {
            name: 'questflow-user-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);