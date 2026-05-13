import { useEffect, useState } from "react";
import { Button, Card } from "./ui";
import { useTranslation } from "react-i18next";
import { useUserStore } from "../store/userStore";

const CURRENT_APP_VERSION = "1.2";

export default function ChangelogModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { isAuthed, isGuest } = useUserStore();

  // We load items from translation, but fall back to empty array if not loaded yet
  const changelogItems = t('changelog.items', { returnObjects: true }) as string[] || [];

  useEffect(() => {
    // Ждем секунду после загрузки, чтобы не пугать юзера сразу
    const timer = setTimeout(() => {
      const langChecked = localStorage.getItem("qf_lang_check");
      const savedVersion = localStorage.getItem("qf_app_version");
      if (langChecked === "true" && savedVersion !== CURRENT_APP_VERSION && (isAuthed || isGuest)) {
        setIsOpen(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthed, isGuest]);

  const handleClose = () => {
    localStorage.setItem("qf_app_version", CURRENT_APP_VERSION);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-lg p-6 sm:p-8 bg-gradient-to-br from-[#0a0f18] to-slate-900 border border-blue-500/30 shadow-[0_20px_60px_rgba(37,99,235,0.2)] animate-in zoom-in-95 duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-2xl animate-bounce">
            🎉
          </div>
          <div>
            <h2 className="text-2xl font-black text-white leading-tight">{t('changelog.title')}</h2>
            <div className="text-blue-400 font-bold text-sm tracking-widest uppercase">{t('changelog.subtitle', { version: CURRENT_APP_VERSION })}</div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-white/80 font-medium text-sm">
            {t('changelog.desc')}
          </p>
          <ul className="flex flex-col gap-3">
            {Array.isArray(changelogItems) && changelogItems.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-white/70">
                <span className="text-emerald-400 shrink-0">✔</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          variant="primary"
          onClick={handleClose}
          className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
        >
          {t('changelog.button')}
        </Button>
      </Card>
    </div>
  );
}
