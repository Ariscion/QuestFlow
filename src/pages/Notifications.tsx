import React from "react";
import { Button, Card, Panel } from "../components/ui";

type N = { id: string; title: string; body: string; time: string; type: "alert" | "success" | "promo" };

const items: N[] = [
  { id: "n1", type: "alert", title: "Падение цены!", body: "Цена на Cyberpunk 2077 в Steam упала на 50%. Исторический минимум!", time: "Сегодня, 14:30" },
  { id: "n2", type: "success", title: "Новый уровень", body: "Вы получили достижение «Охотник за скидками» и 150 XP.", time: "Сегодня, 10:15" },
  { id: "n3", type: "promo", title: "Раздача Epic Games", body: "Не забудьте забрать бесплатную игру этой недели в EGS.", time: "Вчера" },
];

export default function Notifications() {
  return (
      <div className="h-full flex flex-col gap-5">
        <div className="text-sm text-white/65 font-semibold">Уведомления и Активности</div>

        <Panel className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 bg-black/20">
          <div className="space-y-3">
            {items.map(n => (
                <Card key={n.id} className="p-4 bg-white/[0.02] border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white/85 font-semibold flex items-center gap-2">
                      {n.type === "alert" && <span className="text-red-400">🔥</span>}
                      {n.type === "success" && <span className="text-emerald-400">⭐</span>}
                      {n.type === "promo" && <span className="text-blue-400">🎁</span>}
                      {n.title}
                    </div>
                    <div className="text-[11px] text-white/45">{n.time}</div>
                  </div>
                  <div className="text-xs text-white/55 mt-2 leading-relaxed">{n.body}</div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="soft" className="text-xs py-1.5 bg-white/5 hover:bg-white/10">Подробнее</Button>
                    <Button variant="ghost" className="text-xs py-1.5 text-white/40 hover:text-white/80">Скрыть</Button>
                  </div>
                </Card>
            ))}
          </div>

          {/* Твоя крутая Pinned панель */}
          <Panel className="p-5 bg-white/[0.01] border-white/5 h-fit">
            <div className="text-sm text-white/75 font-semibold mb-4 flex items-center gap-2">
              <span>📌</span> Закреплено
            </div>
            <div className="space-y-3">
              <Card className="p-4 bg-green-500/5 border-green-500/10">
                <div className="text-xs text-green-400/60 uppercase font-bold tracking-wider">Статус API</div>
                <div className="text-sm text-green-400 font-semibold mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
                  CheapShark Online
                </div>
              </Card>
              <Card className="p-4 bg-white/[0.02] border-white/5">
                <div className="text-xs text-white/45 uppercase font-bold tracking-wider">Следующий шаг</div>
                <div className="text-sm text-white/70 mt-1 leading-relaxed">
                  Подключение реальной авторизации (Firebase) и облачного сохранения библиотеки.
                </div>
              </Card>
            </div>
          </Panel>
        </Panel>
      </div>
  );
}