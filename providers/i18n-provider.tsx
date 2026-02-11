'use client';

import { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/lib/i18n/config';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: Readonly<I18nProviderProps>) {
  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng');
    const supportedLanguageCodes = Object.keys(SUPPORTED_LANGUAGES);

    let languageToUse = DEFAULT_LANGUAGE;

    if (savedLanguage && supportedLanguageCodes.includes(savedLanguage)) {
      languageToUse = savedLanguage;
    }

    if (i18n.language !== languageToUse) {
      i18n.changeLanguage(languageToUse);
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
