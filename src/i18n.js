import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import bn from './locales/bn.json';


const resources = {
  en: {
    common: en,
    prescriptionsPage: en.prescriptionsPage,
    myPrescriptionsPage: en.myPrescriptionsPage,
    // add other namespaces as needed
  },
  bn: {
    common: bn,
    prescriptionsPage: bn.prescriptionsPage,
    myPrescriptionsPage: bn.myPrescriptionsPage,
    // add other namespaces as needed
  },
};


i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    ns: ['common', 'prescriptionsPage', 'myPrescriptionsPage'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
