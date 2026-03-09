import React from "react";
import { Button, Card, Panel, Progress } from "../components/ui";

type SyncTask = {
    id: string;
    title: string;
    totalItems: number;
    speed: number;
    progress: number;
    state: "syncing" | "paused" | "done"
};

const initial: SyncTask[] = [
    { id: "d1", title: "Steam Account (Ariscion)", totalItems: 342, speed: 12.5, progress: 32, state: "syncing" },
    { id: "d2", title: "Epic Games Library", totalItems: 84, speed: 5.1, progress: 64, state: "paused" },
    { id: "d3", title: "GOG Galaxy Connection", totalItems: 12, speed: 0, progress: 100, state: "done" },
];

export default function Downloads() {
    const [items, setItems] = React.useState<SyncTask[]>(initial);

    React.useEffect(() => {
        const t = setInterval(() => {
            setItems(prev =>
                prev.map(it => {
                    if (it.state !== "syncing") return it;
                    const add = Math.max(0.5, it.speed / 10);
                    const next = Math.min(100, it.progress + add);
                    return { ...it, progress: next, state: next >= 100 ? "done" : "syncing" };
                })
            );
        }, 500);
        return () => clearInterval(t);
    }, []);

    function toggle(id: string) {
        setItems(prev => prev.map(it => {
            if (it.id !== id) return it;
            if (it.state === "done") return it;
            return { ...it, state: it.state === "paused" ? "syncing" : "paused" };
        }));
    }

    return (
        <div className="h-full flex flex-col gap-5">
            <div className="text-sm text-white/65 font-semibold">Синхронизация библиотек</div>

            <Panel className="p-6 bg-black/20">
                <div className="space-y-4">
                    {items.map(it => (
                        <Card key={it.id} className="p-4 bg-white/[0.02] border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="text-sm text-white/85 font-semibold flex items-center gap-2">
                                        {it.state === "syncing" && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                                        {it.title}
                                    </div>
                                    <div className="text-[11px] text-white/45 mt-1">
                                        {it.state === "done" ? "Синхронизировано" : it.state === "paused" ? "Пауза" : `Обработка: ${it.speed.toFixed(1)} игр/сек`}
                                    </div>
                                </div>

                                <Button
                                    variant={it.state === "paused" ? "primary" : "soft"}
                                    onClick={() => toggle(it.id)}
                                    disabled={it.state === "done"}
                                    className={it.state === "paused" ? "bg-blue-600 hover:bg-blue-500" : ""}
                                >
                                    {it.state === "paused" ? "Возобновить" : it.state === "syncing" ? "Пауза" : "Готово"}
                                </Button>
                            </div>

                            <div className="mt-3">
                                {/* Используем твой компонент Progress */}
                                <Progress value={it.progress} />
                                <div className="mt-2 flex justify-between text-[11px] text-white/45 font-medium">
                                    <span>{Math.round(it.progress)}%</span>
                                    <span>{Math.round((it.progress / 100) * it.totalItems)} / {it.totalItems} игр</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="text-xs text-blue-300 font-medium flex gap-2 items-start">
                        <span>ℹ️</span>
                        <span>Здесь отображаются фоновые процессы. Интеграция с официальными API магазинов позволяет автоматически подтягивать купленные вами игры в общую библиотеку QuestFlow.</span>
                    </div>
                </div>
            </Panel>
        </div>
    );
}