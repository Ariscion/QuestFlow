import { useEffect, useState } from "react";
import { Card } from "./ui";
import { useTranslation } from "react-i18next";
import { useToastStore } from "../store/toastStore";

export default function LanguageModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();
  const { addToast } = useToastStore();

  useEffect(() => {
    const isChecked = localStorage.getItem("qf_lang_check");
    if (!isChecked) {
      setIsOpen(true);
    }
  }, []);

  const handleSelect = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("qf_lang_check", "true");
    localStorage.setItem("i18nextLng", lang);
    setIsOpen(false);
    
    const messages = {
      ru: { title: "Язык изменен", message: "Вы можете поменять его в любой момент в настройках." },
      en: { title: "Language changed", message: "You can change it anytime in the settings." },
      kk: { title: "Тіл өзгертілді", message: "Оны кез келген уақытта параметрлерде өзгертуге болады." }
    };
    
    const msg = messages[lang as keyof typeof messages] || messages.en;
    addToast({
      title: msg.title,
      message: msg.message,
      type: "success"
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-lg p-6 sm:p-8 bg-gradient-to-br from-[#0a0f18] to-slate-900 border border-blue-500/30 shadow-[0_20px_60px_rgba(37,99,235,0.2)] animate-in zoom-in-95 duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-2xl">
            🌐
          </div>
          <div>
            <h2 className="text-2xl font-black text-white leading-tight">
              Язык / Language / Тіл
            </h2>
            <div className="text-blue-400 font-bold text-sm tracking-widest uppercase">
              QuestFlow
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-white/80 font-medium text-sm text-center">
            Выберите предпочитаемый язык интерфейса<br/>
            Select your preferred interface language<br/>
            Интерфейстің қолайлы тілін таңдаңыз
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => handleSelect("ru")}
              className="p-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-blue-500/50 rounded-xl transition-all text-left group flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold text-white group-hover:text-blue-400">Русский</div>
                <div className="text-xs text-white/50 mt-0.5">Интерфейс на русском языке</div>
              </div>
              <span className="text-xl">🇷🇺</span>
            </button>
            
            <button
              onClick={() => handleSelect("en")}
              className="p-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-blue-500/50 rounded-xl transition-all text-left group flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold text-white group-hover:text-blue-400">English</div>
                <div className="text-xs text-white/50 mt-0.5">Interface in English</div>
              </div>
              <span className="text-xl">🇬🇧</span>
            </button>
            
            <button
              onClick={() => handleSelect("kk")}
              className="p-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-blue-500/50 rounded-xl transition-all text-left group flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold text-white group-hover:text-blue-400">Қазақша</div>
                <div className="text-xs text-white/50 mt-0.5">Интерфейс қазақ тілінде</div>
              </div>
              <span className="text-xl">🇰🇿</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-white/40 text-center">
          RU: Вы всегда можете изменить язык в настройках.<br/>
          EN: You can always change the language in the settings.<br/>
          KK: Тілді әрқашан параметрлерде өзгертуге болады.
        </p>
      </Card>
    </div>
  );
}
