import { Button, Card, Panel } from "../components/ui";

const features = [
    {
        title: "Единый лаунчер",
        description: "Все ваши игры в одном месте",
    },
    {
        title: "Умная загрузка",
        description: "Управление скоростью и приоритетами",
    },
    {
        title: "Легковесность",
        description: "Минимальное потребление ОЗУ",
    },
];

export default function Downloads() {
    return (
        <div className="h-full overflow-y-auto">
            <Panel className="p-8 md:p-10 bg-black/20 min-h-full flex flex-col justify-center gap-10">
                <section className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200 mb-5">
                        <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
                        Десктоп-клиент в разработке
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                        QuestFlow Desktop
                    </h1>

                    <p className="text-white/65 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                        Получите максимум: авто-обновления, фоновая загрузка и игровой оверлей в нашем нативном клиенте.
                    </p>

                    <div className="flex justify-center">
                        <Button
                            disabled
                            className="px-8 py-3.5 text-base md:text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white opacity-50 cursor-not-allowed hover:from-blue-600 hover:to-indigo-600"
                        >
                            Скачать для Windows
                            <span className="ml-3 rounded-full border border-white/30 bg-white/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                                Скоро
                            </span>
                        </Button>
                    </div>
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