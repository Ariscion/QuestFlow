import { Button, Card, Panel } from "@/shared/ui/Primitives";
import { useAppStore } from "@/entities/game/model/appStore";
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
            <Panel className="p-8 md:p-10 min-h-full flex flex-col justify-center gap-10">
                <section className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-300 mb-5">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        {isInstalled ? t('downloads.status.installed') : t('downloads.status.ready')}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
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
                                ? "bg-emerald-600 hover:bg-emerald-500" 
                                : isInstallable 
                                ? "bg-blue-600 hover:bg-blue-500 shadow-sm" 
                                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750"
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
                            className="p-5 bg-slate-950/20 border border-slate-800/60 hover:border-slate-750 transition-colors"
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