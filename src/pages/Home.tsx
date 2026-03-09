import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Button, Panel, Pill } from "../components/ui";
import { GAMES_DB } from "../data/database";
import { useUserStore } from "../store/userStore";
import { useApp } from "../app/store"; // <-- Подключили глобальный стор для поиска

// Локальный словарь жанров, чтобы не переписывать базу данных
const GENRES: Record<string, string> = {
  "cyberpunk_2077": "RPG / Cyberpunk",
  "hades_2": "Roguelike / Action",
  "rdr_2": "Action / Adventure",
  "alan_wake_2": "Survival Horror",
  "cs_2": "Shooter / Competitive",
  "gta_v": "Action / Open World",
  "bg_3": "RPG / Strategy"
};

export default function Home() {
  const nav = useNavigate();

  // Достаем строку поиска из шапки (TopBar)
  const { state } = useApp();
  const searchQuery = state?.search || "";

  // Достаем всю инфу из нашего глобального мозга (Zustand)
  const { library, userLevel, userXP, xpToNextLevel, balanceKZT } = useUserStore();

  // Берем топовую игру для главного баннера
  const featuredGame = GAMES_DB[0];

  // Игры в тренде (берем 4 штуки со 2-й по 5-ю)
  const trendingGames = GAMES_DB.slice(1, 5);

  // Последние купленные игры (переворачиваем массив, чтобы новые были первыми, берем до 3 штук)
  const recentGames = [...library].reverse().slice(0, 3);

  // Вычисляем процент до следующего уровня
  const xpPercentage = Math.min(100, Math.round((userXP / xpToNextLevel) * 100));

  // --- ЛОГИКА ПОИСКА ---
  // Если юзер что-то ввел в поиск, показываем результаты вместо дашборда
  if (searchQuery) {
    const searchResults = GAMES_DB.filter(game =>
        game.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col gap-6 overflow-y-auto pr-2 pb-6">
          <div className="flex items-end justify-between shrink-0">
            <div>
              <div className="text-sm text-white/50 font-medium mb-1">QuestFlow Search</div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Результаты по запросу: <span className="text-blue-400">"{searchQuery}"</span>
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {searchResults.length > 0 ? (
                searchResults.map(game => (
                    <Card key={game.id} className="p-4 hover:bg-white/[0.08] transition-colors border-white/5 flex gap-4 cursor-pointer group" onClick={() => nav("/game/" + game.id)}>
                      <img
                          src={game.image}
                          alt={game.title}
                          className="w-20 h-28 object-cover rounded-lg shadow-md group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all"
                      />
                      <div className="flex flex-col justify-center">
                        <div className="text-sm font-bold text-white mb-1 leading-tight">{game.title}</div>
                        <div className="text-[11px] text-blue-400 font-medium mb-3">
                          {GENRES[game.id] || "Игры QuestFlow"}
                        </div>
                        <Button variant="soft" className="w-fit px-4 h-8 text-xs bg-white/5 hover:bg-white/10 border-white/10" onClick={(e) => { e.stopPropagation(); nav("/game/" + game.id); }}>
                          Подробнее
                        </Button>
                      </div>
                    </Card>
                ))
            ) : (
                <Card className="col-span-full p-12 flex flex-col items-center justify-center text-center border-dashed border-white/10 bg-white/[0.01]">
                  <div className="text-4xl mb-4 opacity-50">🕵️‍♂️</div>
                  <div className="text-lg font-bold text-white/80 mb-2">Игры не найдены</div>
                  <div className="text-sm text-white/40">
                    По вашему запросу "{searchQuery}" ничего не нашлось в нашей базе данных.
                  </div>
                </Card>
            )}
          </div>
        </div>
    );
  }

  // --- СТАНДАРТНЫЙ ДАШБОРД (Если поиск пуст) ---
  return (
      <div className="h-full flex flex-col gap-6 overflow-y-auto pr-2 pb-6">

        {/* --- ШАПКА И ПРИВЕТСТВИЕ --- */}
        <div className="flex items-end justify-between shrink-0">
          <div>
            <div className="text-sm text-white/50 font-medium mb-1">QuestFlow Dashboard</div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              С возвращением, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Геймер-Аналитик</span>
            </h1>
          </div>

          {/* Мини-статистика в шапке */}
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <div className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">Уровень {userLevel}</div>
              <div className="w-32 h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all" style={{ width: `${xpPercentage}%` }} />
              </div>
            </div>
            <div className="flex flex-col items-end pl-4 border-l border-white/10">
              <div className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">Баланс</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">{balanceKZT.toLocaleString('ru-RU')} ₸</div>
            </div>
          </div>
        </div>

        {/* --- ГЛАВНЫЙ БАННЕР (FEATURED) --- */}
        <Panel className="p-0 overflow-hidden relative border-white/10 group cursor-pointer shrink-0" onClick={() => nav("/game/" + featuredGame.id)}>
          <div className="relative h-[280px] w-full">
            <img
                src={featuredGame.image}
                alt={featuredGame.title}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

            <div className="absolute bottom-0 left-0 p-8 flex flex-col items-start max-w-xl">
              <Pill className="bg-blue-600/20 text-blue-300 border-blue-500/30 mb-3 backdrop-blur-md">
                Игра Дня
              </Pill>
              <h2 className="text-4xl font-black text-white drop-shadow-lg mb-2">{featuredGame.title}</h2>
              <p className="text-sm text-white/60 mb-6 leading-relaxed">
                Окунитесь в захватывающий мир. Проверьте актуальные цены в QuestFlow и заберите игру с максимальной выгодой прямо сейчас.
              </p>
              <div className="flex gap-3">
                <Button variant="primary" onClick={(e) => { e.stopPropagation(); nav("/store"); }}>
                  Найти скидку
                </Button>
                <Button variant="soft" onClick={(e) => { e.stopPropagation(); nav("/game/" + featuredGame.id); }}>
                  Подробнее
                </Button>
              </div>
            </div>
          </div>
        </Panel>

        <div className="grid grid-cols-3 gap-6 shrink-0">
          {/* --- ЛЕВАЯ КОЛОНКА: БИБЛИОТЕКА (2/3 ширины) --- */}
          <div className="col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/70 font-bold uppercase tracking-wider">Недавно куплено</div>
              <Link to="/library" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Вся библиотека →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {recentGames.length > 0 ? (
                  recentGames.map(game => (
                      <Card key={game.id} className="p-4 hover:bg-white/[0.08] transition-colors border-white/5 flex gap-4 cursor-pointer group" onClick={() => nav("/game/" + game.id)}>
                        <img
                            src={game.image}
                            alt={game.title}
                            className="w-20 h-28 object-cover rounded-lg shadow-md group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all"
                        />
                        <div className="flex flex-col justify-center">
                          <div className="text-sm font-bold text-white mb-1 leading-tight">{game.title}</div>
                          <div className="text-[11px] text-emerald-400 font-medium mb-3 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Готово к запуску
                          </div>
                          <Button variant="soft" className="w-fit px-4 h-8 text-xs bg-white/5 hover:bg-white/10 border-white/10" onClick={(e) => { e.stopPropagation(); alert("Запуск игры..."); }}>
                            Играть
                          </Button>
                        </div>
                      </Card>
                  ))
              ) : (
                  <Card className="col-span-2 p-8 flex flex-col items-center justify-center text-center border-dashed border-white/10 bg-white/[0.01]">
                    <div className="text-3xl mb-3 opacity-50">🛒</div>
                    <div className="text-sm font-bold text-white/80 mb-1">Ваша библиотека пуста</div>
                    <div className="text-xs text-white/40 mb-4 max-w-xs">
                      Самое время отправиться в магазин и найти лучшие предложения на игры!
                    </div>
                    <Button variant="primary" onClick={() => nav("/store")}>
                      Перейти в Магазин
                    </Button>
                  </Card>
              )}
            </div>
          </div>

          {/* --- ПРАВАЯ КОЛОНКА: В ТРЕНДЕ (1/3 ширины) --- */}
          <div className="col-span-1 flex flex-col gap-4">
            <div className="text-sm text-white/70 font-bold uppercase tracking-wider">Популярное сейчас</div>

            <Panel className="p-4 flex flex-col gap-3 bg-white/[0.02] border-white/5">
              {trendingGames.map((game, i) => (
                  <div
                      key={game.id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer group"
                      onClick={() => nav("/game/" + game.id)}
                  >
                    <div className="text-lg font-black text-white/10 group-hover:text-white/20 w-4 text-center">
                      {i + 1}
                    </div>
                    <img
                        src={game.image}
                        alt={game.title}
                        className="w-12 h-12 rounded-lg object-cover border border-white/5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white/90 truncate group-hover:text-blue-300 transition-colors">{game.title}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{GENRES[game.id] || "Игры QuestFlow"}</div>
                    </div>
                  </div>
              ))}
              <Button variant="soft" className="w-full mt-2 text-xs" onClick={() => nav("/store")}>
                Посмотреть все
              </Button>
            </Panel>
          </div>
        </div>
      </div>
  );
}