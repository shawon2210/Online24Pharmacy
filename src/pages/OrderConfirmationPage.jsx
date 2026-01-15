import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import SEOHead from "../components/common/SEOHead";
import { useTranslation } from "react-i18next";
import { orderApi } from "../utils/apiClient";
import LoadingSpinner from "../components/common/LoadingSpinner";
import toast from "react-hot-toast";

export default function OrderConfirmationPage() {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setError(null);
        const response = await orderApi.getById(orderId);
        setOrder(response);
      } catch (err) {
        console.error(t("orderConfirmationPage.fetchOrderError"), err);
        const errorMessage =
          err.message || t("orderConfirmationPage.failedToLoadOrder");
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, t]);

  if (loading) {
    return (
      <>
        <SEOHead title={t("orderConfirmationPage.seoTitle")} />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <LoadingSpinner size="lg" text={t("orderConfirmationPage.loading")} />
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <SEOHead title={t("orderConfirmationPage.seoTitle")} />
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 max-w-md text-center border border-red-200 dark:border-red-800">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {t("orderConfirmationPage.orderNotFound")}
            </h2>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                {error}
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title={t("orderConfirmationPage.seoTitle")} />
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <CheckCircleIcon className="w-20 h-20 text-green-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4 text-foreground">
          {t("orderConfirmationPage.thankYou")}
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          {t("orderConfirmationPage.orderConfirmed")} #{order.orderNumber}
        </p>

        <div className="bg-card rounded-lg shadow p-6 mb-8 text-left border border-border">
          <h2 className="text-lg font-bold mb-4 text-foreground">
            {t("orderConfirmationPage.orderDetails")}
          </h2>
          <div className="space-y-2 text-muted-foreground">
            <p>
              <span className="font-semibold">
                {t("orderConfirmationPage.orderNumber")}:
              </span>{" "}
              {order.orderNumber}
            </p>
            <p>
              <span className="font-semibold">
                {t("orderConfirmationPage.totalAmount")}:
              </span>{" "}
              ৳{order.totalAmount}
            </p>
            <p>
              <span className="font-semibold">
                {t("orderConfirmationPage.paymentMethod")}:
              </span>{" "}
              {order.paymentMethod === "cod"
                ? t("orderConfirmationPage.cashOnDelivery")
                : order.paymentMethod}
            </p>
            <p>
              <span className="font-semibold">
                {t("orderConfirmationPage.estimatedDelivery")}:
              </span>{" "}
              {t("orderConfirmationPage.within24Hours")}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={`/track-order?orderId=${order.orderNumber}`}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90"
          >
            {t("orderConfirmationPage.trackOrder")}
          </Link>
          <Link
            to="/"
            className="bg-border text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-border"
          >
            {t("orderConfirmationPage.continueShopping")}
          </Link>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          {t("orderConfirmationPage.confirmationSent")}
        </p>
      </div>
    </>
  );
}
