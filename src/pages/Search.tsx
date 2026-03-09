import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../app/store';

export default function Search() {
    // Достаем state и actions напрямую, как это сделано в Layout.tsx
    const { state, actions } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;

        // 1. Обновляем глобальный стейт поиска через встроенный экшен
        actions.setSearch(query);

        // 2. Умный редирект: если мы начали писать, но мы не в магазине — кидаем в магазин!
        // Но если мы очистили строку, остаемся где были.
        if (query.trim() !== '' && location.pathname !== '/store') {
            navigate('/store');
        }
    };

    return (
        <div className="relative w-full max-w-md group">
            {/* Иконка лупы для красоты */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-white/40 group-focus-within:text-blue-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
            </div>

            <input
                type="text"
                placeholder="Поиск игр (например, Cyberpunk)..."
                value={state.search || ""}
                onChange={handleSearchChange}
                className="w-full bg-[#0a0f18]/60 border border-white/10 text-white placeholder-white/40 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
            />

            {/* Кнопка крестика (очистить поиск), появляется только когда есть текст */}
            {state.search && (
                <button
                    onClick={() => actions.setSearch("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}