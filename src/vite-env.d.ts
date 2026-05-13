/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface Window {
    Telegram?: {
        WebApp: {
            initDataUnsafe: {
                user?: {
                    id: number;
                    first_name: string;
                    last_name?: string;
                    username?: string;
                    language_code?: string;
                };
            };
            ready: () => void;
            expand: () => void;
        };
    };
}

