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
      <div className="min-h-screen flex items-center justify-center">
        {t("orderTrackingPage.loading")}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("orderTrackingPage.orderNotFound")}
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
      <div className="min-h-screen bg-gray-50 py-6 md:py-10">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t("orderTrackingPage.orderNumber")} #{order.orderNumber}
                </h1>
                <p className="text-gray-600">
                  {t("orderTrackingPage.placedOn")}{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  ৳{order.totalAmount}
                </p>
                <p className="text-sm text-gray-600">
                  {order.paymentMethod.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">
                {t("orderTrackingPage.orderStatus")}
              </h3>
              <div className="flex items-center justify-between">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isCurrent
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        <step.icon className="w-5 h-5" />
                      </div>
                      <p
                        className={`text-sm mt-2 text-center ${
                          isCompleted || isCurrent
                            ? "text-gray-900 font-medium"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.description && (
                        <p className="text-xs mt-1 text-center text-gray-600">
                          {step.description}
                        </p>
                      )}
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`h-1 w-full mt-4 ${
                            index < currentStepIndex
                              ? "bg-green-500"
                              : "bg-gray-200"
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
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  {t("orderTrackingPage.shippingAddress")}
                </h3>
                <div className="text-gray-600">
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  <p>
                    {order.shippingAddress.area}, {order.shippingAddress.city}
                  </p>
                  <p>{order.shippingAddress.phone}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">
                  {t("orderTrackingPage.estimatedDelivery")}
                </h3>
                <div className="text-gray-600">
                  {order.deliveryDate ? (
                    <p className="font-medium text-green-600">
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
              <h3 className="text-lg font-semibold mb-4">
                {t("orderTrackingPage.orderItems")}
              </h3>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={
                          item.product.images[0] ||
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAzMkwzMiA0OEgzVjUySDM4TDMyIDMyWiIgZmlsbD0iIzlDQTNBMiIvPgo8cGF0aCBkPSJNMzIgMzJIMzhWNTJIMzhMMzIgMzJ6IiBmaWxsPSIjOUNBM0EyIi8+Cjx0ZXh0IHg9IjMyIiB5PSIzOCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjM2NkYxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+"
                        }
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">
                          {t("orderTrackingPage.quantity")}: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">৳{item.totalPrice}</p>
                      <p className="text-sm text-gray-600">
                        ৳{item.unitPrice} {t("orderTrackingPage.each")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between items-center mb-2">
                <span>{t("orderTrackingPage.subtotal")}</span>
                <span>
                  ৳
                  {(
                    parseFloat(order.totalAmount) -
                    parseFloat(order.shippingCost)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>{t("orderTrackingPage.shipping")}</span>
                <span>৳{order.shippingCost}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                <span>{t("orderTrackingPage.total")}</span>
                <span>৳{order.totalAmount}</span>
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
          <div className="bg-emerald-50 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-emerald-900 mb-2">
              {t("orderTrackingPage.needHelp")}
            </h3>
            <p className="text-emerald-700 mb-4">
              {t("orderTrackingPage.contactSupport")}
            </p>
            <div className="flex justify-center space-x-4">
              <a href="tel:+8801234567890" className="btn-primary">
                {t("orderTrackingPage.callSupport")}
              </a>
              <a
                href="mailto:support@online24pharmacy.com"
                className="btn-secondary"
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
