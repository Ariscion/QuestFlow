import { useState, useCallback } from "react";
import { setPriceAlert, removePriceAlert, type PriceAlert } from "../lib/firebase";
import { useUserStore } from "../store/userStore";
import { useToastStore } from "../store/toastStore";
import { useQueryClient } from "@tanstack/react-query";
import { usePriceAlerts } from "../hooks/usePriceAlerts";

interface PriceAlertButtonProps {
    gameID: string;
    title: string;
    thumb: string;
    currentPrice: number; // USD
}

export function PriceAlertButton({ gameID, title, thumb, currentPrice }: PriceAlertButtonProps) {
    const user = useUserStore((s) => s.user);
    const isAuthed = useUserStore((s) => s.isAuthed);
    const addToast = useToastStore((s) => s.addToast);
    const queryClient = useQueryClient();

    const { data: alerts } = usePriceAlerts(user?.uid);
    const hasAlert = alerts?.some((a) => a.gameID === gameID) ?? false;

    const [isLoading, setIsLoading] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [targetInput, setTargetInput] = useState(
        currentPrice > 0 ? String(Math.max(0.01, currentPrice * 0.8).toFixed(2)) : "5.00"
    );

    const handleToggle = useCallback(async () => {
        if (!isAuthed || !user?.uid) {
            addToast({ title: "Требуется вход", message: "Войдите, чтобы настроить алерты цены", type: "info" });
            return;
        }

        if (hasAlert) {
            // Remove alert
            setIsLoading(true);
            try {
                await removePriceAlert(user.uid, gameID);
                await queryClient.invalidateQueries({ queryKey: ["priceAlerts", user.uid] });
                addToast({ title: "Алерт удалён", message: title, type: "info" });
            } catch {
                addToast({ title: "Ошибка", message: "Не удалось удалить алерт", type: "error" });
            } finally {
                setIsLoading(false);
            }
        } else {
            // Show price input
            setShowInput(true);
        }
    }, [isAuthed, user?.uid, hasAlert, gameID, title, addToast, queryClient]);

    const handleSaveAlert = useCallback(async () => {
        if (!user?.uid) return;
        const targetPrice = parseFloat(targetInput);
        if (isNaN(targetPrice) || targetPrice <= 0) {
            addToast({ title: "Неверная цена", message: "Введите корректную целевую цену в USD", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            const alert: PriceAlert = {
                gameID,
                title,
                thumb,
                targetPrice,
                currentPrice,
                createdAt: new Date().toISOString(),
            };
            await setPriceAlert(user.uid, alert);
            await queryClient.invalidateQueries({ queryKey: ["priceAlerts", user.uid] });
            setShowInput(false);
            addToast({
                title: "🔔 Алерт установлен",
                message: `Уведомим, когда «${title}» опустится ниже $${targetPrice.toFixed(2)}`,
                type: "xp",
                duration: 5000,
            });
        } catch {
            addToast({ title: "Ошибка", message: "Не удалось сохранить алерт", type: "error" });
        } finally {
            setIsLoading(false);
        }
    }, [user?.uid, targetInput, gameID, title, thumb, currentPrice, addToast, queryClient]);

    if (!isAuthed) return null;

    return (
        <div className="w-full">
            {showInput ? (
                <div className="flex flex-col gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <div className="text-xs text-amber-300 font-semibold">
                        🔔 Уведомить при цене ниже (USD)
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="text-sm text-white/50">$</span>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={targetInput}
                            onChange={(e) => setTargetInput(e.target.value)}
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-400/60 focus:bg-white/15 transition-all"
                            placeholder="Целевая цена"
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSaveAlert}
                            disabled={isLoading}
                            className="flex-1 py-1.5 text-xs font-bold bg-amber-500/80 hover:bg-amber-500 text-black rounded-lg transition-all disabled:opacity-50"
                        >
                            {isLoading ? "Сохраняем..." : "Сохранить алерт"}
                        </button>
                        <button
                            onClick={() => setShowInput(false)}
                            className="px-3 py-1.5 text-xs text-white/40 hover:text-white/80 rounded-lg transition-colors"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleToggle}
                    disabled={isLoading}
                    className={`w-full text-xs py-1.5 border transition-all rounded-lg flex items-center justify-center gap-1.5 ${
                        hasAlert
                            ? "border-amber-500/40 bg-amber-500/15 text-amber-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
                            : "border-white/5 text-white/50 hover:bg-amber-500/15 hover:text-amber-400 hover:border-amber-500/30"
                    } disabled:opacity-50`}
                    title={hasAlert ? "Нажмите, чтобы удалить алерт" : "Получить уведомление при падении цены"}
                >
                    <span>{hasAlert ? "🔔" : "🔕"}</span>
                    <span>{hasAlert ? "Алерт активен — убрать" : "Уведомить о скидке"}</span>
                </button>
            )}
        </div>
    );
}
