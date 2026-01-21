import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import SEOHead from "../components/common/SEOHead";
import { fetchWishlist, removeFromWishlist, addToCart } from "../utils/api";
import {
  HeartIcon,
  ShoppingCartIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function WishlistPage() {
  const { t } = useTranslation();

  const {
    data: wishlistItems = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
  });

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId);
      toast.success(t("wishlist.removed"));
      refetch();
    } catch (_error) {
      toast.error(t("wishlist.removeError"));
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.id);
      toast.success(t("cartPage.added"));
    } catch (_error) {
      toast.error(t("cartPage.addError"));
    }
  };

  if (isLoading) {
    return (
      <>
        <SEOHead title={t("wishlist.title")} />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEOHead title={t("wishlist.title")} />
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {t("status.error")}
            </h2>
            <p className="text-muted-foreground mb-4">{t("wishlist.error")}</p>
            <button
              onClick={refetch}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              {t("buttons.retry")}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title={t("wishlist.title")} />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Link
              to="/account"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3 sm:mb-4 text-sm sm:text-base"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {t("buttons.back")}
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <HeartSolidIcon className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {t("wishlist.title")}
                </h1>
                {wishlistItems.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {wishlistItems.length}{" "}
                    {wishlistItems.length === 1 ? "item" : "items"}
                  </p>
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">
              {t("wishlist.subtitle")}
            </p>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-8 sm:py-12 md:py-16 px-4">
              <HeartIcon className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                {t("wishlist.empty")}
              </h2>
              <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base max-w-md mx-auto">
                {t("wishlist.emptyDesc")}
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm sm:text-base"
              >
                <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                {t("wishlist.browseProducts")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 xs:gap-3 sm:gap-4 md:gap-6">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-all duration-200 group"
                >
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    <img
                      src={
                        item.product?.images?.[0] ||
                        "https://via.placeholder.com/300?text=No+Image"
                      }
                      alt={item.product?.name || "Product"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300?text=No+Image";
                      }}
                    />
                    <button
                      onClick={() => handleRemoveFromWishlist(item.productId)}
                      className="absolute top-2 right-2 p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100 sm:opacity-100 shadow-sm"
                      title={t("wishlist.remove")}
                    >
                      <HeartSolidIcon className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                    </button>
                  </div>
                  <div className="p-3 sm:p-3 md:p-4">
                    <h3 className="font-medium text-foreground mb-1 sm:mb-2 line-clamp-2 text-sm sm:text-sm md:text-base leading-tight min-h-2.5rem sm:min-h-3rem">
                      {item.product?.name || "Unknown Product"}
                    </h3>
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <span className="text-sm sm:text-base md:text-lg font-bold text-primary">
                        ৳
                        {item.product?.price
                          ? item.product.price.toFixed(2)
                          : "0.00"}
                      </span>
                      {item.product?.discountPrice && (
                        <span className="text-xs sm:text-sm text-muted-foreground line-through">
                          ৳{item.product.discountPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(item.product)}
                      className="w-full bg-primary text-primary-foreground px-2 sm:px-3 md:px-4 py-2 sm:py-2 rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 sm:gap-2 shadow-sm hover:shadow-md"
                    >
                      <ShoppingCartIcon className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                      <span className="hidden sm:inline truncate">
                        {t("buttons.addToCart")}
                      </span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
