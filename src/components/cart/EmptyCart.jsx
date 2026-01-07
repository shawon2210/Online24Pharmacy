import { Link } from "react-router-dom";
import { ShoppingCartIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../../utils/constants";

/**
 * Empty cart state component
 * Displays when cart has no items
 */
export default function EmptyCart() {
  const { t } = useTranslation();

  return (
    <div className="w-full mx-auto px-4 sm:px-6 md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
      <div className="bg-background rounded-xl shadow-lg border border-border p-8 sm:p-12 lg:p-16 text-center">
        <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-muted mx-auto mb-4 sm:mb-6">
          <ShoppingCartIcon className="w-8 sm:w-10 h-8 sm:h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-2 sm:mb-3">
          {t("cartPage.emptyCartTitle")}
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
          {t("cartPage.emptyCartDesc")}
        </p>
        <Link
          to={ROUTES.PRODUCTS}
          className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-600 to-green-600 text-background px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold hover:from-emerald-700 hover:to-green-700 transition-all shadow-md hover:shadow-lg active:scale-95 text-sm sm:text-base"
        >
          <span>{t("cartPage.browseProducts")}</span>
          <ArrowRightIcon className="w-4 sm:w-5 h-4 sm:h-5" />
        </Link>
      </div>
    </div>
  );
}
