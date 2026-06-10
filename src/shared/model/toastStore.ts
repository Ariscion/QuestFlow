import { create } from "zustand";

export type ToastType = "success" | "info" | "error" | "xp" | "levelup";

export interface Toast {
    id: string;
    title: string;
    message?: string;
    type: ToastType;
    duration?: number;
}

interface ToastState {
    toasts: Toast[];
    levelUpData: { level: number } | null;
    
    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
    
    triggerLevelUp: (level: number) => void;
    clearLevelUp: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    levelUpData: null,
    
    addToast: (toast) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
        
        if (toast.duration !== 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id),
                }));
            }, toast.duration || 4000);
        }
    },
    
    removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
    })),
    
    triggerLevelUp: (level) => {
        set({ levelUpData: { level } });
        setTimeout(() => {
            set({ levelUpData: null });
        }, 5000); // 5 seconds display for level up
    },
    
    clearLevelUp: () => set({ levelUpData: null }),
}));
