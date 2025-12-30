import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { TagIcon } from "@heroicons/react/24/outline";
import { applyCoupon } from "../../utils/api";

export default function CouponSystem({ cartTotal, onCouponApplied }) {
  const { t } = useTranslation();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const applyCouponMutation = useMutation({
    mutationFn: applyCoupon,
    onSuccess: (data) => {
      setAppliedCoupon(data);
      onCouponApplied(data);
      setCouponCode("");
    },
  });

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim()) {
      applyCouponMutation.mutate({
        code: couponCode.trim(),
        cartTotal,
      });
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    onCouponApplied(null);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center mb-3">
        <TagIcon className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="font-medium text-gray-900">
          {t("promoCode", "Promo Code")}
        </h3>
      </div>

      {!appliedCoupon ? (
        <form onSubmit={handleApplyCoupon} className="flex space-x-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder={t("enterCoupon", "Enter coupon code")}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <button
            type="submit"
            disabled={!couponCode.trim() || applyCouponMutation.isPending}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 text-sm"
          >
            {applyCouponMutation.isPending
              ? t("applying", "Applying...")
              : t("apply", "Apply")}
          </button>
        </form>
      ) : (
        <div className="flex justify-between items-center bg-green-50 p-3 rounded-md">
          <div>
            <p className="font-medium text-green-800">{appliedCoupon.code}</p>
            <p className="text-sm text-green-600">
              {appliedCoupon.type === "percentage"
                ? `${appliedCoupon.value}% off`
                : `৳${appliedCoupon.value} off`}
            </p>
          </div>
          <button
            onClick={removeCoupon}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            {t("remove", "Remove")}
          </button>
        </div>
      )}

      {applyCouponMutation.isError && (
        <p className="text-red-600 text-sm mt-2">
          {applyCouponMutation.error?.response?.data?.error ||
            t("invalidCoupon", "Invalid coupon code")}
        </p>
      )}

      {/* Popular Coupons */}
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">
          {t("popularOffers", "Popular offers:")}
        </p>
        <div className="flex flex-wrap gap-2">
          {["FIRST10", "SAVE50", "HEALTH20"].map((code) => (
            <button
              key={code}
              onClick={() => setCouponCode(code)}
              className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs hover:bg-emerald-200"
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
