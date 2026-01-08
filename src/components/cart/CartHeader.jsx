import { useTranslation } from "react-i18next";

/**
 * Cart page header component
 * Displays title, badge, and item count
 */
export default function CartHeader({ itemCount }) {
  const { t } = useTranslation();

  return (
    <div className="mb-0">
      <div className="inline-block mb-3 sm:mb-4">
        <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-linear-to-r from-emerald-100 to-cyan-100 border-2 border-emerald-200 text-emerald-700 rounded-full text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-shadow duration-300">
          <span className="text-lg sm:text-xl">🛒</span>
          <span>{t("cartPage.badge")}</span>
        </span>
      </div>
      <h1 className="font-black text-foreground mb-2 sm:mb-3 tracking-tight leading-tight">
        <span className="bg-linear-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
          {t("cartPage.title")}
        </span>
      </h1>
      <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl">
        {itemCount > 0
          ? t("cartPage.itemsCount", { count: itemCount })
          : t("cartPage.emptyCartDesc")}
      </p>
    </div>
  );
}
