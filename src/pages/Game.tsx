import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Panel, Pill, Skeleton } from "../components/ui";
import { GAMES_DB } from "../data/database";
import { useUserStore } from "../store/userStore";

export default function Game() {
  const { id } = useParams<{ id: string }>(); // Достаем ID из адресной строки
  const nav = useNavigate();

  // Глобальный стейт
  const balanceKZT = useUserStore((s) => s.balanceKZT);
  const buyGame = useUserStore((s) => s.buyGame);
  const library = useUserStore((s) => s.library);

  // Локальный стейт для страницы
  const [game, setGame] = useState<any>(null);
  const [steamDetails, setSteamDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Проверяем, куплена ли игра
  const isOwned = library.some(g => g.id === id);

  useEffect(() => {
    // 1. Ищем игру в нашей локальной БД
    const foundGame = GAMES_DB.find(g => g.id === id);

    if (!foundGame) {
      setLoading(false);
      return;
    }

    setGame(foundGame);

    // 2. Если есть Steam App ID, тянем красивое описание и скрины из Steam API
    if (foundGame.steamAppId) {
      fetch(`/api/steam/appdetails?appids=${foundGame.steamAppId}&l=russian`)
          .then(res => res.json())
          .then(data => {
            const details = data[foundGame.steamAppId!].data;
            setSteamDetails(details);
          })
          .catch(err => console.error("Ошибка загрузки деталей Steam:", err))
          .finally(() => setLoading(false));
    } else {
      setLoading(false); // Для Epic-эксклюзивов просто выключаем загрузку
    }
  }, [id]);

  const handleBuy = (priceLabel: string, storeName: string) => {
    if (!game) return;

    // Подготавливаем объект игры для библиотеки
    const gameToBuy = {
      id: game.id,
      title: game.title,
      image: game.image,
      steamPrice: game.steamAppId ? "Куплено" : "Эксклюзив Epic",
      epicPrice: game.epicPrice || "Эксклюзив Steam"
    };

    const success = buyGame(gameToBuy, priceLabel, storeName);
    if (success) {
      alert(`Успешно куплено в ${storeName}!`);
    }
  };

  if (loading) {
    return (
        <div className="h-full flex flex-col gap-4 p-6">
          <Skeleton className="h-[300px] w-full rounded-[24px]" />
          <div className="flex gap-4">
            <Skeleton className="h-[200px] flex-1 rounded-[24px]" />
            <Skeleton className="h-[200px] w-[300px] rounded-[24px]" />
          </div>
        </div>
    );
  }

  if (!game) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-white/50">
          <div className="text-4xl mb-4">🕵️‍♂️</div>
          <h2 className="text-xl font-bold text-white/80">Игра не найдена</h2>
          <p className="mb-6">Возможно, она была удалена из базы.</p>
          <Button variant="soft" onClick={() => nav("/store")}>Вернуться в магазин</Button>
        </div>
    );
  }

  // Обработка цен
  const isSteamExclusive = !game.epicPrice;
  const isEpicExclusive = !game.steamAppId;
  const steamPrice = steamDetails?.price_overview?.final_formatted || (game.steamAppId ? "Нет в продаже" : "Эксклюзив Epic");
  const epicPrice = game.epicPrice || "Эксклюзив Steam";

  // Очищаем HTML-теги из описания Steam (Steam присылает строку с <br> и <strong>)
  const cleanDescription = steamDetails?.short_description
      ? steamDetails.short_description.replace(/<[^>]*>?/gm, '')
      : "Захватывающее приключение, которое подарит вам незабываемые эмоции. Описание временно недоступно.";

  return (
      <div className="h-full flex flex-col overflow-y-auto overflow-x-hidden relative rounded-2xl">

        {/* --- HERO СЕКЦИЯ (Огромный баннер) --- */}
        <div className="relative w-full h-[380px] shrink-0">
          {/* Фоновая картинка с градиентом */}
          <img
              src={steamDetails?.background || game.image}
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Затемнение снизу, чтобы текст читался */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

          {/* Контент поверх баннера */}
          <div className="absolute bottom-0 left-0 w-full p-8 flex items-end justify-between gap-6">
            <div className="flex-1">
              <Button variant="ghost" className="mb-4 text-white/50 hover:text-white" onClick={() => nav(-1)}>
                ← Назад
              </Button>
              <h1 className="text-5xl font-black text-white drop-shadow-xl">{game.title}</h1>
              <div className="flex gap-3 mt-4">
                {steamDetails?.genres?.slice(0, 3).map((g: any) => (
                    <Pill key={g.id} className="bg-white/10 text-white/80 border-white/20 backdrop-blur-md">
                      {g.description}
                    </Pill>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- ОСНОВНОЙ КОНТЕНТ --- */}
        <div className="p-8 flex gap-8 relative z-10 bg-slate-950 flex-1">

          {/* Левая колонка: Описание и Скриншоты */}
          <div className="flex-1 flex flex-col gap-8">
            <Panel className="p-6 bg-white/[0.02] border-white/5">
              <h3 className="text-lg font-bold text-white/90 mb-3">Об игре</h3>
              <p className="text-white/60 leading-relaxed text-sm">
                {cleanDescription}
              </p>
            </Panel>

            {/* Скриншоты (если есть от Steam) */}
            {steamDetails?.screenshots && (
                <div>
                  <h3 className="text-lg font-bold text-white/90 mb-4">Скриншоты</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {steamDetails.screenshots.slice(0, 4).map((shot: any) => (
                        <img
                            key={shot.id}
                            src={shot.path_thumbnail}
                            alt="Screenshot"
                            className="w-full rounded-xl border border-white/10 hover:scale-105 transition-transform cursor-pointer"
                        />
                    ))}
                  </div>
                </div>
            )}
          </div>

          {/* Правая колонка: Блок покупки */}
          <div className="w-[340px] shrink-0 flex flex-col gap-5">
            <Panel className="p-6 bg-gradient-to-br from-indigo-900/20 to-blue-900/10 border-blue-500/20 sticky top-4">
              <img
                  src={game.image}
                  alt="Cover"
                  className="w-full rounded-xl shadow-2xl mb-6 border border-white/10"
              />

              {isOwned ? (
                  <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="text-2xl mb-2">✅</div>
                    <div className="text-emerald-400 font-bold">Уже в библиотеке</div>
                    <Button variant="primary" className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 border-none" onClick={() => nav("/library")}>
                      Перейти к загрузке
                    </Button>
                  </div>
              ) : (
                  <div className="flex flex-col gap-4">
                    <div className="text-sm text-white/50 text-center">Выберите платформу для покупки:</div>

                    {/* Кнопка Steam */}
                    <Card className={`p-4 flex justify-between items-center ${isEpicExclusive ? 'opacity-40 grayscale' : 'hover:bg-white/[0.1] border-white/20'}`}>
                      <div>
                        <div className="text-xs text-white/50">Steam</div>
                        <div className="text-lg font-bold text-white">{steamPrice}</div>
                      </div>
                      <Button
                          variant="primary"
                          disabled={isEpicExclusive}
                          onClick={() => handleBuy(steamPrice, 'Steam')}
                      >
                        Купить
                      </Button>
                    </Card>

                    {/* Кнопка Epic Games */}
                    <Card className={`p-4 flex justify-between items-center ${isSteamExclusive ? 'opacity-40 grayscale' : 'hover:bg-white/[0.1] border-white/20'}`}>
                      <div>
                        <div className="text-xs text-white/50">Epic Games</div>
                        <div className="text-lg font-bold text-white">{epicPrice}</div>
                      </div>
                      <Button
                          variant="soft"
                          disabled={isSteamExclusive}
                          onClick={() => handleBuy(epicPrice, 'Epic Games')}
                      >
                        Купить
                      </Button>
                    </Card>

                    <div className="text-xs text-center text-white/40 mt-2">
                      Ваш баланс: <span className="text-emerald-400 font-bold">{balanceKZT.toLocaleString()} ₸</span>
                    </div>
                  </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
  );
}