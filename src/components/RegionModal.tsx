import { useEffect, useState } from "react";
import { Card } from "./ui";
import { useUserStore } from "../store/userStore";
import { useTranslation } from "react-i18next";

export default function RegionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { setCurrencyInfo, isAuthed, isGuest } = useUserStore();
  const { t } = useTranslation();

  useEffect(() => {
    // Проверяем, был ли уже выбран язык
    const langChecked = localStorage.getItem("qf_lang_check");
    // Проверяем, был ли уже выбран регион
    const isChecked = localStorage.getItem("qf_currency_check");
    
    if (langChecked === "true" && !isChecked && (isAuthed || isGuest)) {
      setIsOpen(true);
    }
  }, [isAuthed, isGuest]);

  const handleSelect = (countryCode: string) => {
    if (countryCode === "KZ") {
      setCurrencyInfo({ code: "KZT", symbol: "₸", rateToUSD: 450, countryCode: "KZ" });
    } else if (countryCode === "RU") {
      setCurrencyInfo({ code: "RUB", symbol: "₽", rateToUSD: 92, countryCode: "RU" });
    } else if (countryCode === "UA") {
      setCurrencyInfo({ code: "UAH", symbol: "₴", rateToUSD: 40, countryCode: "UA" });
    } else {
      setCurrencyInfo({ code: "USD", symbol: "$", rateToUSD: 1, countryCode });
    }
    
    localStorage.setItem("qf_currency_check", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 animate-in fade-in duration-300">
      <Card className="w-full max-w-lg p-6 sm:p-8 bg-slate-900 border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl">
            🌍
          </div>
          <div>
            <h2 className="text-2xl font-black text-white leading-tight">{t('region_modal.title')}</h2>
            <div className="text-blue-400 font-bold text-sm tracking-widest uppercase">{t('region_modal.subtitle')}</div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-white/80 font-medium text-sm">
            {t('region_modal.desc')}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleSelect("KZ")}
              className="p-3 bg-slate-950/40 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl transition-all text-left group"
            >
              <div className="text-sm font-bold text-white group-hover:text-blue-400">🇰🇿 {t('region_modal.stores.kz')}</div>
              <div className="text-xs text-white/50 mt-0.5">{t('region_modal.currencies.kz')}</div>
            </button>
            
            <button
              onClick={() => handleSelect("RU")}
              className="p-3 bg-slate-950/40 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl transition-all text-left group"
            >
              <div className="text-sm font-bold text-white group-hover:text-blue-400">🇷🇺 {t('region_modal.stores.ru')}</div>
              <div className="text-xs text-white/50 mt-0.5">{t('region_modal.currencies.ru')}</div>
            </button>
            
            <button
              onClick={() => handleSelect("TR")}
              className="p-3 bg-slate-950/40 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl transition-all text-left group"
            >
              <div className="text-sm font-bold text-white group-hover:text-blue-400">🇹🇷 {t('region_modal.stores.tr')}</div>
              <div className="text-xs text-white/50 mt-0.5">{t('region_modal.currencies.tr')}</div>
            </button>
            
            <button
              onClick={() => handleSelect("UA")}
              className="p-3 bg-slate-950/40 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl transition-all text-left group"
            >
              <div className="text-sm font-bold text-white group-hover:text-blue-400">🇺🇦 {t('region_modal.stores.ua')}</div>
              <div className="text-xs text-white/50 mt-0.5">{t('region_modal.currencies.ua')}</div>
            </button>
            
            <button
              onClick={() => handleSelect("US")}
              className="p-3 bg-slate-950/40 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl transition-all text-left group sm:col-span-2"
            >
              <div className="text-sm font-bold text-white group-hover:text-blue-400">🌐 {t('region_modal.stores.other')}</div>
              <div className="text-xs text-white/50 mt-0.5">{t('region_modal.currencies.other')}</div>
            </button>
          </div>
        </div>

        <p className="text-xs text-white/40 text-center">
          {t('region_modal.footer')}
        </p>
      </Card>
    </div>
  );
}
