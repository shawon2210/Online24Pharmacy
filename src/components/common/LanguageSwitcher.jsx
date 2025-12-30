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
      className={`group relative flex items-center justify-center w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
        i18n.language === "bn" ? "ring-2 ring-emerald-400" : ""
      }`}
      aria-label={
        i18n.language === "en" ? t("switchToBangla") : t("switchToEnglish")
      }
      tabIndex={0}
    >
      <span className="text-base font-bold text-white drop-shadow-lg select-none">
        {i18n.language === "en" ? t("englishShort") : t("banglaShort")}
      </span>
      <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
        {i18n.language === "en" ? t("viewInBangla") : t("viewInEnglish")}
      </span>
    </button>
  );
}
