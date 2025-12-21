import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import SEOHead from "../components/common/SEOHead";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function OrderConfirmationPage() {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await axios.get(`${API_URL}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(response.data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading)
    return (
      <div className="text-center py-20">
        {t("orderConfirmationPage.loading")}
      </div>
    );
  if (!order)
    return (
      <div className="text-center py-20">
        {t("orderConfirmationPage.orderNotFound")}
      </div>
    );

  return (
    <>
      <SEOHead title="Order Confirmation - Online24 Pharma" />
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <CheckCircleIcon className="w-20 h-20 text-green-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">
          {t("orderConfirmationPage.thankYou")}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {t("orderConfirmationPage.orderConfirmed")} #{order.orderNumber}
        </p>

        <div className="bg-white rounded-lg shadow p-6 mb-8 text-left">
          <h2 className="text-lg font-bold mb-4">
            {t("orderConfirmationPage.orderDetails")}
          </h2>
          <div className="space-y-2 text-gray-600">
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
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700"
          >
            {t("orderConfirmationPage.trackOrder")}
          </Link>
          <Link
            to="/"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
          >
            {t("orderConfirmationPage.continueShopping")}
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          {t("orderConfirmationPage.confirmationSent")}
        </p>
      </div>
    </>
  );
}
