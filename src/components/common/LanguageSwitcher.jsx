import { useTranslation } from '../../hooks/useTranslation';

/**
 * Language switcher component
 */
export default function LanguageSwitcher() {
  const { language, changeLanguage } = useTranslation();
  
  const languages = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'bn', label: 'বাং', name: 'বাংলা' }
  ];
  
  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-1.5 rounded-lg font-bold text-sm transition-colors ${
            language === lang.code
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-label={`Switch to ${lang.name}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
