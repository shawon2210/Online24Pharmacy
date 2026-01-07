import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { fetchOrder } from "../utils/api";
import SEOHead from "../components/common/SEOHead";
import ColdChainTracking from "../components/order/ColdChainTracking";
import { useTranslation } from "react-i18next";

export default function OrderTrackingPage() {
  const { t } = useTranslation();
  const { orderId } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 dark:border-emerald-400 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">{t("orderTrackingPage.loading")}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 px-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8 max-w-md text-center">
          <div className="text-4xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("orderTrackingPage.orderNotFound")}</h2>
        </div>
      </div>
    );
  }

  const statusSteps = [
    {
      key: "pending",
      label: t("orderTrackingPage.orderPlaced"),
      description: t("orderTrackingPage.orderConfirmedDesc"),
      icon: CheckCircleIcon,
    },
    {
      key: "confirmed",
      label: t("orderTrackingPage.confirmed"),
      description: t("orderTrackingPage.orderConfirmedDesc"),
      icon: CheckCircleIcon,
    },
    {
      key: "processing",
      label: t("orderTrackingPage.processing"),
      description: t("orderTrackingPage.processingDesc"),
      icon: ClockIcon,
    },
    {
      key: "shipped",
      label: t("orderTrackingPage.shipped"),
      description: t("orderTrackingPage.outForDeliveryDesc"),
      icon: TruckIcon,
    },
    {
      key: "delivered",
      label: t("orderTrackingPage.delivered"),
      description: t("orderTrackingPage.deliveredDesc"),
      icon: HomeIcon,
    },
  ];

  const currentStepIndex = statusSteps.findIndex(
    (step) => step.key === order.status
  );

  return (
    <>
      <SEOHead
        title={order ? t('orderTrackingPage.seoTitleWithNumber', { orderNumber: order.orderNumber }) : t('orderTrackingPage.seoTitle')}
        description={t('orderTrackingPage.seoDescription', { orderNumber: order ? order.orderNumber : '' })}
        url={`/orders/${orderId}`}
      />
      
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border-b border-gray-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <nav className="mb-3" aria-label={t("breadcrumb")}>
            <ol className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
              <li>
                <a href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium">
                  {t("home")}
                </a>
              </li>
              <li className="px-1 text-gray-500 dark:text-gray-400">/</li>
              <li className="text-gray-900 dark:text-white font-bold" aria-current="page">
                {t("orderTrackingPage.orderTracking")}
              </li>
            </ol>
          </nav>
          <h1 className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {t("orderTrackingPage.orderNumber")} #{order.orderNumber}
          </h1>
        </div>
      </div>

      <div className="min-h-screen bg-white dark:bg-slate-900 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t("orderTrackingPage.placedOn")}{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  ৳{order.totalAmount}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {order.paymentMethod.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                {t("orderTrackingPage.orderStatus")}
              </h3>
              <div className="flex items-center justify-between gap-2">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                          isCompleted
                            ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-lg"
                            : isCurrent
                            ? "bg-emerald-500 dark:bg-emerald-400 text-white shadow-lg ring-2 ring-emerald-200 dark:ring-emerald-700"
                            : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        <step.icon className="w-5 h-5" />
                      </div>
                      <p
                        className={`text-xs md:text-sm mt-2 text-center font-semibold ${
                          isCompleted || isCurrent
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.description && (
                        <p className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400 hidden md:block">
                          {step.description}
                        </p>
                      )}
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`h-1 w-full mt-4 transition-colors ${
                            index < currentStepIndex
                              ? "bg-emerald-600 dark:bg-emerald-500"
                              : "bg-gray-200 dark:bg-slate-700"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {t("orderTrackingPage.shippingAddress")}
                </h3>
                <div className="text-gray-600 dark:text-gray-300 space-y-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  <p>
                    {order.shippingAddress.area}, {order.shippingAddress.city}
                  </p>
                  <p>{order.shippingAddress.phone}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {t("orderTrackingPage.estimatedDelivery")}
                </h3>
                <div className="text-gray-600 dark:text-gray-300">
                  {order.deliveryDate ? (
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                      {new Date(order.deliveryDate).toLocaleDateString()}
                    </p>
                  ) : (
                    <p>{t("orderTrackingPage.businessDays")}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {t("orderTrackingPage.orderItems")}
              </h3>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={
                          item.product.images[0] ||
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAzMkwzMiA0OEgzVjUySDM4TDMyIDMyWiIgZmlsbD0iIzlDQTNBMiIvPgo8cGF0aCBkPSJNMzIgMzJIMzhWNTJIMzhMMzIgMzJ6IiBmaWxsPSIjOUNBM0EyIi8+Cjx0ZXh0IHg9IjMyIiB5PSIzOCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjM2NkYxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+"
                        }
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{item.product.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("orderTrackingPage.quantity")}: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">৳{item.totalPrice}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ৳{item.unitPrice} {t("orderTrackingPage.each")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-6">
              <div className="flex justify-between items-center mb-2 text-gray-900 dark:text-white">
                <span>{t("orderTrackingPage.subtotal")}</span>
                <span>
                  ৳
                  {(
                    parseFloat(order.totalAmount) -
                    parseFloat(order.shippingCost)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2 text-gray-900 dark:text-white">
                <span>{t("orderTrackingPage.shipping")}</span>
                <span>৳{order.shippingCost}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg border-t border-gray-200 dark:border-slate-700 pt-2 text-gray-900 dark:text-white">
                <span>{t("orderTrackingPage.total")}</span>
                <span className="text-emerald-600 dark:text-emerald-400">৳{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Cold Chain Tracking */}
          <ColdChainTracking
            orderId={order.id}
            hasColdChainItems={order.orderItems.some(
              (item) => item.product.requiresColdChain
            )}
          />

          {/* Contact Support */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 md:p-8 text-center border border-emerald-200 dark:border-emerald-800">
            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-2">
              {t("orderTrackingPage.needHelp")}
            </h3>
            <p className="text-emerald-800 dark:text-emerald-200 mb-4">
              {t("orderTrackingPage.contactSupport")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <a href="tel:+8801234567890" className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                {t("orderTrackingPage.callSupport")}
              </a>
              <a
                href="mailto:support@online24pharmacy.com"
                className="bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t("orderTrackingPage.emailUs")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
