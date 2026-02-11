'use client';

import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/config';

export function useLanguage() {
  const { t, i18n } = useTranslation();

  const changeLanguage = useCallback(
    (language: string) => {
      if (Object.keys(SUPPORTED_LANGUAGES).includes(language)) {
        i18n.changeLanguage(language);
        localStorage.setItem('i18nextLng', language);
      }
    },
    [i18n]
  );

  return {
    t,
    currentLanguage: i18n.language,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}
