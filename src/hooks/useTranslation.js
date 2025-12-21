import { useTranslation as useI18nTranslation } from 'react-i18next';

/**
 * Custom translation hook with namespace support
 * @param {string} namespace - Translation namespace (common, home, auth, etc.)
 * @returns {Object} Translation function and i18n instance
 */
export const useTranslation = (namespace = 'common') => {
  const { t, i18n } = useI18nTranslation(namespace);
  
  return {
    t,
    i18n,
    language: i18n.language,
    changeLanguage: i18n.changeLanguage
  };
};

export default useTranslation;
