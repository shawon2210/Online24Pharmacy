import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { en, bn } from '../locales';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: 'en',
    lng: 'en',
    
    // Namespace configuration
    ns: ['common', 'home', 'auth', 'cart', 'products'],
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
    
    resources: {
      en: {
        common: en.common,
        home: en.home,
        auth: en.auth,
        cart: en.cart,
        products: en.products
      },
      bn: {
        common: bn.common,
        home: bn.home,
        auth: bn.auth,
        cart: bn.cart,
        products: bn.products
      }
    }
  });

export default i18n;
