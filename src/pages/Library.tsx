import React from "react";
import { Button, Card, Panel, Pill } from "../components/ui";
import { useUserStore } from "../store/userStore";
import { useApp } from "../app/store";

export default function Library() {
    // Убрали balanceKZT из деструктуризации
    const { library, userLevel, userXP, xpToNextLevel } = useUserStore();
    const { state } = useApp();

    const xpPercentage = Math.min(100, Math.round((userXP / xpToNextLevel) * 100));

    return (
        <div className="h-full flex flex-col gap-5 overflow-hidden">
            <div className="flex flex-col gap-3 shrink-0">
                <div className="text-sm text-white/65 font-semibold">Аккаунт QuestFlow</div>

                <Panel className="p-6 bg-gradient-to-r from-blue-900/40 to-indigo-900/20 border-blue-500/20">
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 p-[2px] shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border-2 border-transparent">
                                    <span className="text-xl font-bold text-white">{userLevel}</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-white">{state.user?.name ?? "Геймер-Аналитик"}</div>
                                <div className="text-xs text-blue-300">Уровень профиля: {userLevel}</div>
                            </div>
                        </div>

                        <div className="flex-1 max-w-md">
                            <div className="flex justify-between text-xs text-white/60 mb-2 font-medium">
                                <span>{userXP} XP</span>
                                <span>{xpToNextLevel} XP</span>
                            </div>
                            <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                    style={{ width: `${xpPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Заменили Баланс на статистику игр */}
                        <div className="text-right">
                            <div className="text-xs text-blue-400/80 uppercase tracking-wider mb-1">Синхронизировано</div>
                            <div className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                {library.length} <span className="text-sm font-normal text-white/60">игр</span>
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>

            <Panel className="p-6 flex-1 overflow-y-auto relative bg-black/20">
                <div className="flex items-center justify-between mb-6">
                    <div className="text-lg text-white/90 font-bold">Синхронизированные игры</div>
                    <Pill className="bg-white/5 text-white/70 border-white/10">
                        Игр в коллекции: {library.length}
                    </Pill>
                </div>

                {library.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                        <div className="text-4xl mb-4 opacity-50">🎮</div>
                        <div className="text-lg font-medium text-white/70 mb-2">Библиотека пуста</div>
                        <div className="text-sm text-white/40 max-w-xs">
                            Перейдите в магазин, чтобы найти лучшие скидки и пополнить свою коллекцию.
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                        {library.map((game, index) => (
                            <Card key={`${game.id}-${index}`} className="p-4 flex flex-col gap-4 bg-white/[0.03] hover:bg-white/[0.06] transition-colors border-white/5">
                                <img
                                    src={game.image}
                                    alt={game.title}
                                    className="w-full h-32 object-cover rounded-xl shadow-inner opacity-90 hover:opacity-100 transition-opacity"
                                />
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-white truncate">{game.title}</h3>

                                    <div className="mt-2 space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-white/40">Платформа:</span>
                                            <span className="text-white/80 font-medium">{game.purchasedStore}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-white/40">Цена на момент перехода:</span>
                                            <span className="text-emerald-400 font-medium">{game.purchasedPrice}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-white/40">Дата:</span>
                                            <span className="text-white/60">
                                                {game.purchasedAt ? new Date(game.purchasedAt).toLocaleDateString('ru-RU') : 'Неизвестно'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="primary" className="w-full bg-blue-600 hover:bg-blue-500 text-white border-none" onClick={() => alert(`Запуск игры ${game.title}...\nПеренаправление в лаунчер...`)}>
                                    Установить / Играть
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </Panel>
        </div>
    );
}