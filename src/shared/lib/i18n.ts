import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ru from './locales/ru.json';
import en from './locales/en.json';
import kk from './locales/kk.json';

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      kk: { translation: kk }
    },
    lng: localStorage.getItem('i18nextLng') || 'ru', // Язык из локального хранилища или по умолчанию
    fallbackLng: 'en', // Язык, если перевод не найден
    interpolation: {
      escapeValue: false // React сам экранирует строки
    }
  });

export default i18n;
