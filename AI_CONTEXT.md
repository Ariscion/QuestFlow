Информационная система: QuestFlow (Deals Aggregator)

1. Описание проекта

QuestFlow — это отказоустойчивая геймифицированная платформа и агрегатор цен на цифровые товары (игры). Приложение сравнивает цены между магазинами (Steam, Epic Games) и позволяет пользователю "покупать" игры, накапливая опыт (XP) и уровни.

2. Технический стек

Frontend: React 18, Vite.

Стилизация: Tailwind CSS (Glassmorphism, Ambient Light, Dark Mode).

Роутинг: react-router-dom (защищенные роуты <Protected>).

State Management: Zustand (с middleware persist для сохранения в localStorage).

IDE: JetBrains WebStorm.

3. Ключевая архитектура и Паттерны

Graceful Degradation: При падении API или отсутствии интернета система не ломается, а подтягивает данные из кэша localStorage (ключ qf_steam_cache_v1).

API-слой вынесен в хуки: Вся логика работы со Steam API находится в src/hooks/useDeals.ts.

Глобальный стейт вынесен в стор: Баланс, библиотека игр и логика начисления XP лежат в src/store/userStore.ts.

Бизнес-логика (Аналитика): При каждом переходе в магазин (клик) срабатывает трекинг, пользователю начисляется XP.

4. Структура директорий (src/)

/app - Глобальные провайдеры (AppProvider, useIsReady).

/components/ui - Переиспользуемые компоненты: Card, Panel, Button, Pill, Skeleton, Layout.

/hooks - Кастомные хуки (например, useDeals.ts).

/store - Глобальные стейты Zustand (userStore.ts).

/pages - Страницы приложения:

Store.tsx - Главная витрина агрегатора с Live-API.

Library.tsx - Библиотека купленных игр пользователя, прогресс-бар XP и баланс.

Home, Game, Downloads, Search, Notifications, Settings, States.

5. Правила написания кода для ИИ (AI Instructions)

НЕ ЛОМАТЬ РОУТИНГ: Страницы подключаются в App.tsx через <Route element={<Protected><PageName /></Protected>}>.

ИСПОЛЬЗОВАТЬ ZUSTAND: Для передачи данных между страницами не использовать prop drilling, обращаться к useUserStore.

UI КОМПОНЕНТЫ: Всегда импортировать готовые UI элементы из ../components/ui (Panel, Card, Button). Не писать голые div-ы там, где можно использовать Panel.

СТИЛЬ: Темная тема, Tailwind CSS, градиенты bg-gradient-to-br from-indigo-950/20 via-black/40, скругления rounded-[20px].