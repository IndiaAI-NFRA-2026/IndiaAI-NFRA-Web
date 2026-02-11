import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from '@/lib/i18n/locales/en.json';
import viTranslation from '@/lib/i18n/locales/vi.json';
import thTranslation from '@/lib/i18n/locales/th.json';

export enum LANGUAGE {
  EN = 'en',
  VI = 'vi',
  TH = 'th',
}

export const SUPPORTED_LANGUAGES = {
  [LANGUAGE.EN]: { name: 'English', flag: '🇬🇧' },
  [LANGUAGE.VI]: { name: 'Tiếng Việt', flag: '🇻🇳' },
  [LANGUAGE.TH]: { name: 'ไทย', flag: '🇹🇭' },
};

export const DEFAULT_LANGUAGE = 'en';

const resources = {
  en: {
    translation: enTranslation,
  },
  vi: {
    translation: viTranslation,
  },
  th: {
    translation: thTranslation,
  },
};

const initI18n = () => {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources,
      fallbackLng: DEFAULT_LANGUAGE,
      lng: DEFAULT_LANGUAGE,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
  }
  return i18n;
};

export default initI18n();
