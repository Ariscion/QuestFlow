import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { saveUserDataToDb } from "../lib/firebase";
import { applyXpGain, XP_LEVELING, XP_VALUES } from "../lib/xp";
import { useToastStore } from "./toastStore";
import i18n from "../i18n";

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

export type UserProvider = "Google" | "Email" | "Telegram" | "Unknown";

export type User = {
    uid: string;
    name: string;
    email?: string | null;
    avatar?: string | null;
    provider: UserProvider;
};

export type CurrencyInfo = {
    code: string;
    symbol: string;
    rateToUSD: number;
    countryCode: string;
};

export type CloudUserData = Partial<Pick<UserState, "library" | "wishlist" | "userXP" | "userLevel" | "xpToNextLevel">>;
type ProgressSnapshot = Pick<UserState, "library" | "wishlist" | "userXP" | "userLevel" | "xpToNextLevel">;
const CLOUD_SYNC_DEBOUNCE_MS = 300;

interface UserState {
    user: User | null;
    isAuthed: boolean;
    isReady: boolean;
    isGuest: boolean;

    userLevel: number;
    userXP: number;
    xpToNextLevel: number;
    library: Game[];
    wishlist: Game[];
    currencyInfo: CurrencyInfo;

    setUser: (user?: User) => void;
    signOut: () => void;
    setOnboardingDone: (status: boolean) => void;
    setGuestMode: () => void;
    setCurrencyInfo: (info: CurrencyInfo) => void;

    buyGame: (gameData: Game, purchasedPrice: string, storeName: string) => boolean;
    removeGame: (id: string) => void;
    toggleWishlist: (gameData: Game) => void;
    addClickXP: () => void;
    setCloudData: (data: CloudUserData) => void;
    reset: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => {
            let cloudSyncTimer: ReturnType<typeof setTimeout> | null = null;

            const getProgressSnapshot = (): ProgressSnapshot => {
                const { library, wishlist, userLevel, userXP, xpToNextLevel } = get();
                return { library, wishlist, userLevel, userXP, xpToNextLevel };
            };

            const syncProgressToCloud = () => {
                if (cloudSyncTimer) {
                    clearTimeout(cloudSyncTimer);
                }

                cloudSyncTimer = setTimeout(() => {
                    cloudSyncTimer = null;
                    const { user } = get();
                    if (!user?.uid) {
                        return;
                    }

                    const snapshot = getProgressSnapshot();
                    void saveUserDataToDb(user.uid, snapshot);
                }, CLOUD_SYNC_DEBOUNCE_MS);
            };

            return {
            user: null,
            isAuthed: false,
            isReady: false,
            isGuest: false,

            userLevel: XP_LEVELING.initialLevel,
            userXP: 0,
            xpToNextLevel: XP_LEVELING.initialThreshold,
            library: [],
            wishlist: [],
            currencyInfo: { code: "KZT", symbol: "₸", rateToUSD: 450, countryCode: "KZ" },

            setUser: (user) => set(() => ({
                user: user ?? null,
                isAuthed: Boolean(user),
                isGuest: false,
            })),

            signOut: () => {
                if (cloudSyncTimer) {
                    clearTimeout(cloudSyncTimer);
                    cloudSyncTimer = null;
                }

                set(() => ({
                    user: null,
                    isAuthed: false,
                    isReady: false,
                    isGuest: false,
                }));
            },

            setOnboardingDone: (status) => set(() => ({
                isReady: status,
            })),

            setGuestMode: () => set(() => ({
                isGuest: true,
                isReady: true,
                isAuthed: false,
            })),

            setCurrencyInfo: (info) => set(() => ({ currencyInfo: info })),

            buyGame: (gameData, purchasedPrice, storeName) => {
                const { library } = get();

                if (library.find(g => g.id === gameData.id)) {
                    console.warn("Игра уже синхронизирована с библиотекой!");
                    return false;
                }

                set((state) => {
                    const nextProgress = applyXpGain(
                        {
                            userXP: state.userXP,
                            userLevel: state.userLevel,
                            xpToNextLevel: state.xpToNextLevel,
                        },
                        XP_VALUES.addToLibrary
                    );

                    if (nextProgress.userLevel > state.userLevel) {
                        useToastStore.getState().triggerLevelUp(nextProgress.userLevel);
                    } else {
                        useToastStore.getState().addToast({
                            title: i18n.t('notifications.game_added'),
                            message: i18n.t('notifications.xp_gained', { xp: XP_VALUES.addToLibrary }),
                            type: "xp"
                        });
                    }

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
                        userXP: nextProgress.userXP,
                        userLevel: nextProgress.userLevel,
                        xpToNextLevel: nextProgress.xpToNextLevel,
                    };
                });

                syncProgressToCloud();

                return true;
            },

            removeGame: (id) => {
                set((state) => ({
                    library: state.library.filter(g => g.id !== id)
                }));
                syncProgressToCloud();
            },

            toggleWishlist: (gameData) => {
                set((state) => {
                    const exists = state.wishlist?.some(g => g.id === gameData.id);
                    let newWishlist;
                    if (exists) {
                        newWishlist = state.wishlist.filter(g => g.id !== gameData.id);
                        useToastStore.getState().addToast({ title: i18n.t('notifications.wishlist_removed'), message: gameData.title, type: "info" });
                    } else {
                        newWishlist = [...(state.wishlist || []), gameData];
                        useToastStore.getState().addToast({ title: i18n.t('notifications.wishlist_added'), message: gameData.title, type: "info" });
                    }
                    return { wishlist: newWishlist };
                });
                syncProgressToCloud();
            },

            addClickXP: () => {
                set((state) => {
                    const nextProgress = applyXpGain(
                        {
                            userXP: state.userXP,
                            userLevel: state.userLevel,
                            xpToNextLevel: state.xpToNextLevel,
                        },
                        XP_VALUES.storeRedirect
                    );

                    if (nextProgress.userLevel > state.userLevel) {
                        useToastStore.getState().triggerLevelUp(nextProgress.userLevel);
                    } else {
                        useToastStore.getState().addToast({
                            title: i18n.t('notifications.hunter_bonus'),
                            message: i18n.t('notifications.xp_gained_store', { xp: XP_VALUES.storeRedirect }),
                            type: "info"
                        });
                    }

                    return {
                        userXP: nextProgress.userXP,
                        userLevel: nextProgress.userLevel,
                        xpToNextLevel: nextProgress.xpToNextLevel,
                    };
                });

                syncProgressToCloud();
            },

            setCloudData: (data) => set((state) => ({
                library: data.library ?? state.library,
                wishlist: data.wishlist ?? state.wishlist ?? [],
                userXP: data.userXP ?? state.userXP,
                userLevel: data.userLevel ?? state.userLevel,
                xpToNextLevel: data.xpToNextLevel ?? state.xpToNextLevel,
            })),

            reset: () => {
                if (cloudSyncTimer) {
                    clearTimeout(cloudSyncTimer);
                    cloudSyncTimer = null;
                }

                set(() => ({
                    library: [],
                    wishlist: [],
                    userXP: 0,
                    userLevel: XP_LEVELING.initialLevel,
                    xpToNextLevel: XP_LEVELING.initialThreshold,
                }));
            }
        };
        },
        {
            name: "questflow-user-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);