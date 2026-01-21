import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const handleLangToggle = () => {
    const nextLang = i18n.language === "en" ? "bn" : "en";
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={handleLangToggle}
      className={`group relative flex items-center justify-center w-10 h-10 lg:w-9 lg:h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/20 dark:hover:to-purple-800/20 hover:shadow-lg hover:shadow-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 ${i18n.language === "bn" ? "ring-2 ring-purple-500/50" : ""}`}
      aria-label={
        i18n.language === "en" ? t("switchToBangla") : t("switchToEnglish")
      }
      tabIndex={0}
    >
      <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform duration-300 select-none">
        {i18n.language === "en" ? t("englishShort") : t("banglaShort")}
      </span>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-400/0 to-purple-500/0 group-hover:from-purple-400/10 group-hover:to-purple-500/10 transition-all duration-300" />
      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-lg border border-gray-200 dark:border-gray-700">
        {i18n.language === "en" ? t("viewInBangla") : t("viewInEnglish")}
      </span>
    </button>
  );
}
