import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {LANGUAGE_DETECTOR} from './languageDetector';
import en from './en.json';
import ur from './ur.json';

const resources = {
  en: {
    translation: en,
  },
  ur: {
    translation: ur,
  },
};

i18n
  .use(initReactI18next)
  .use(LANGUAGE_DETECTOR)
  .init({
    resources,
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
  });
