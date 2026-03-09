import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Тип для наших аналитических событий
interface AnalyticsEvent {
    eventName: string;
    timestamp: string;
    page: string;
    data?: any;
}

export function useAnalytics() {
    const location = useLocation();

    // 1. Отслеживание времени на сайте (Time on Site)
    useEffect(() => {
        const startTime = Date.now();
        const currentPage = location.pathname;

        // Записываем событие "Вход на страницу"
        trackEvent('PAGE_VIEW', { path: currentPage });

        // Когда пользователь уходит со страницы (Component Unmount)
        return () => {
            const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
            trackEvent('TIME_ON_PAGE', {
                path: currentPage,
                durationSeconds: timeSpentSeconds
            });
        };
    }, [location.pathname]);

    // 2. Метод для записи любых кликов (CTR)
    const trackEvent = (eventName: string, data?: any) => {
        const newEvent: AnalyticsEvent = {
            eventName,
            timestamp: new Date().toISOString(),
            page: location.pathname,
            data
        };

        // В реальном проекте тут был бы fetch() на наш бэкенд (Google Analytics/Яндекс.Метрика).
        // Для учебного проекта пишем в localStorage браузера.
        try {
            const existingLogs = JSON.parse(localStorage.getItem('qf_analytics_logs') || '[]');
            existingLogs.push(newEvent);
            // Храним только последние 100 событий, чтобы не забить память
            if (existingLogs.length > 100) existingLogs.shift();
            localStorage.setItem('qf_analytics_logs', JSON.stringify(existingLogs));

            // Выводим в консоль для удобства отладки (QA)
            console.log(`📊 [Analytics] ${eventName}:`, data || '');
        } catch (error) {
            console.error('Ошибка записи аналитики', error);
        }
    };

    return { trackEvent };
}