import { Button, Card, Panel } from "../components/ui";
import { useAppStore } from "../store/appStore";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Downloads() {
    const { t } = useTranslation();
    const { deferredPrompt, setDeferredPrompt } = useAppStore();
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    const features = [
        {
            title: t('downloads.features.launcher.title'),
            description: t('downloads.features.launcher.desc'),
        },
        {
            title: t('downloads.features.download.title'),
            description: t('downloads.features.download.desc'),
        },
        {
            title: t('downloads.features.lightweight.title'),
            description: t('downloads.features.lightweight.desc'),
        },
    ];

    useEffect(() => {
        // Проверяем, установлено ли уже приложение
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }
    }, []);

    useEffect(() => {
        if (deferredPrompt) {
            setIsInstallable(true);
        }
    }, [deferredPrompt]);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert(t('downloads.alert.not_supported'));
            return;
        }

        // Показываем нативный prompt установки
        deferredPrompt.prompt();

        // Ждем решения пользователя
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('Пользователь согласился установить PWA');
            setIsInstallable(false);
            setIsInstalled(true);
        } else {
            console.log('Пользователь отказался от установки');
        }

        // Очищаем prompt, так как он одноразовый
        setDeferredPrompt(null);
    };

    return (
        <div className="h-full overflow-y-auto">
            <Panel className="p-8 md:p-10 bg-black/20 min-h-full flex flex-col justify-center gap-10">
                <section className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200 mb-5">
                        <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
                        {isInstalled ? t('downloads.status.installed') : t('downloads.status.ready')}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                        QuestFlow Desktop
                    </h1>

                    <p className="text-white/65 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                        {t('downloads.hero.desc')}
                    </p>

                    <div className="flex justify-center">
                        <Button
                            onClick={handleInstallClick}
                            className={`px-8 py-3.5 text-base md:text-lg font-semibold text-white transition-all ${
                                isInstalled 
                                ? "bg-emerald-600 hover:bg-emerald-700" 
                                : isInstallable 
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25" 
                                : "bg-white/10 hover:bg-white/20 text-white/90"
                            }`}
                        >
                            {isInstalled ? t('downloads.button.installed') : t('downloads.button.download')}
                        </Button>
                    </div>
                    
                    {!isInstallable && !isInstalled && (
                        <p className="text-xs text-white/40 mt-4 max-w-md mx-auto">
                            {t('downloads.hero.browser_support')}
                        </p>
                    )}
                </section>

                <section className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                    {features.map((feature) => (
                        <Card
                            key={feature.title}
                            className="p-5 bg-white/[0.03] border-white/10 hover:bg-white/[0.05] transition-colors"
                        >
                            <div className="text-lg font-bold text-white mb-2">{feature.title}</div>
                            <div className="text-sm text-white/60 leading-relaxed">{feature.description}</div>
                        </Card>
                    ))}
                </section>
            </Panel>
        </div>
    );
}