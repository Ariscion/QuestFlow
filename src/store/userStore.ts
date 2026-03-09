import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Game {
    id: string;
    title: string;
    image: string;
    steamPrice: string;
    epicPrice: string;
    purchasedAt?: string;
    purchasedPrice?: string;
    purchasedStore?: string;
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
            userLevel: 1,
            userXP: 0,
            xpToNextLevel: 1000,
            balanceKZT: 15000, // Оставляем как виртуальные QF Coins на будущее

            library: [],

            // Метод теперь работает как "Синхронизация" игры после CPA-перехода
            buyGame: (gameData, purchasedPrice, storeName) => {
                const { library } = get();

                if (library.find(g => g.id === gameData.id)) {
                    console.warn('Игра уже синхронизирована с библиотекой!');
                    return false;
                }

                // БОЛЬШЕ НЕТ СПИСАНИЯ ДЕНЕГ! Мы просто добавляем игру и даем XP
                set((state) => {
                    const newXP = state.userXP + 150; // Даем много XP за "покупку" через нас
                    const isLevelUp = newXP >= state.xpToNextLevel;

                    return {
                        library: [
                            ...state.library,
                            {
                                ...gameData,
                                purchasedAt: new Date().toISOString(),
                                purchasedPrice: purchasedPrice,
                                purchasedStore: storeName
                            }
                        ],
                        // state.balanceKZT остается нетронутым!
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