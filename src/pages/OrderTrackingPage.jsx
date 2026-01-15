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
import {
  ORDER_TRACKING_STEPS,
  getTrackingStepIndex,
} from "../hooks/useOrderStatus";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function OrderTrackingPage() {
  const { t } = useTranslation();
  const { orderId } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId),
  });

  if (isLoading) {
    return (
      <>
        <SEOHead title={t("orderTrackingPage.seoTitle")} />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <LoadingSpinner size="lg" text={t("orderTrackingPage.loading")} />
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <SEOHead title={t("orderTrackingPage.seoTitle")} />
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8 max-w-md text-center">
            <div className="text-4xl mb-4">📦</div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {t("orderTrackingPage.orderNotFound")}
            </h2>
          </div>
        </div>
      </>
    );
  }

  const statusSteps = ORDER_TRACKING_STEPS.map((step) => ({
    key: step.key,
    label: t(step.labelKey),
    description: t(`${step.labelKey}Desc`),
    icon:
      {
        [ORDER_TRACKING_STEPS[0].key]: CheckCircleIcon,
        [ORDER_TRACKING_STEPS[1].key]: CheckCircleIcon,
        [ORDER_TRACKING_STEPS[2].key]: ClockIcon,
        [ORDER_TRACKING_STEPS[3].key]: TruckIcon,
        [ORDER_TRACKING_STEPS[4].key]: HomeIcon,
      }[step.key] || CheckCircleIcon,
  }));

  const currentStepIndex = getTrackingStepIndex(order.status);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={
          order
            ? t("orderTrackingPage.seoTitleWithNumber", {
                orderNumber: order.orderNumber,
              })
            : t("orderTrackingPage.seoTitle")
        }
        description={t("orderTrackingPage.seoDescription", {
          orderNumber: order ? order.orderNumber : "",
        })}
        url={`/orders/${orderId}`}
      />

      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md shadow-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="mb-3" aria-label={t("breadcrumb")}>
            <ol className="flex items-center gap-1 text-sm text-foreground">
              <li>
                <a href="/" className="hover:text-primary font-medium">
                  {t("home")}
                </a>
              </li>
              <li className="px-1 text-muted-foreground">/</li>
              <li className="text-foreground font-bold" aria-current="page">
                {t("orderTrackingPage.orderTracking")}
              </li>
            </ol>
          </nav>
          <h1 className="text-2xl md:text-3xl font-black text-primary">
            {t("orderTrackingPage.orderNumber")} #{order.orderNumber}
          </h1>
        </div>
      </div>

      <div className="py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-xl shadow-lg border border-border p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-border">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("orderTrackingPage.placedOn")}{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  ৳{order.totalAmount}
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  {order.paymentMethod.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-foreground mb-6">
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
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : isCurrent
                            ? "bg-primary/90 text-primary-foreground shadow-lg ring-2 ring-primary/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <step.icon className="w-5 h-5" />
                      </div>
                      <p
                        className={`text-xs md:text-sm mt-2 text-center font-semibold ${
                          isCompleted || isCurrent
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.description && (
                        <p className="text-xs mt-1 text-center text-muted-foreground hidden md:block">
                          {step.description}
                        </p>
                      )}
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`h-1 w-full mt-4 transition-colors ${
                            index < currentStepIndex ? "bg-primary" : "bg-muted"
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
              <div className="bg-card rounded-xl p-4 border border-border">
                <h3 className="text-lg font-bold text-foreground mb-3">
                  {t("orderTrackingPage.shippingAddress")}
                </h3>
                <div className="text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">
                    {order.shippingAddress.name}
                  </p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  <p>
                    {order.shippingAddress.area}, {order.shippingAddress.city}
                  </p>
                  <p>{order.shippingAddress.phone}</p>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border">
                <h3 className="text-lg font-bold text-foreground mb-3">
                  {t("orderTrackingPage.estimatedDelivery")}
                </h3>
                <div className="text-muted-foreground">
                  {order.deliveryDate ? (
                    <p className="font-bold text-primary text-lg">
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
              <h3 className="text-lg font-bold text-foreground mb-4">
                {t("orderTrackingPage.orderItems")}
              </h3>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-border rounded-xl bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={
                          item.product.images[0] ||
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAzMkwzMiA0OEgzVjUySDM4TDMyIDMyWiIgZmlsbD0iIzlDQTNBMiIvPgo8cGF0aCBkPSJNMzIgMzJIMzhWNTJIMzhMMzIgMzJ6IiBmaWxsPSIjOUNBM0EyIi8+Cjx0ZXh0IHg9IjMyIiB5PSIzOCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjM2NkYxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+"
                        }
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg border border-border"
                      />
                      <div>
                        <h4 className="font-bold text-foreground">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t("orderTrackingPage.quantity")}: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        ৳{item.totalPrice}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ৳{item.unitPrice} {t("orderTrackingPage.each")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-border pt-4 mt-6">
              <div className="flex justify-between items-center mb-2 text-foreground">
                <span>{t("orderTrackingPage.subtotal")}</span>
                <span>
                  ৳
                  {(
                    parseFloat(order.totalAmount) -
                    parseFloat(order.shippingCost)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2 text-foreground">
                <span>{t("orderTrackingPage.shipping")}</span>
                <span>৳{order.shippingCost}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg border-t border-border pt-2 text-foreground">
                <span>{t("orderTrackingPage.total")}</span>
                <span className="text-primary">৳{order.totalAmount}</span>
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
          <div className="bg-primary/10 rounded-xl p-6 md:p-8 text-center border border-primary/20">
            <h3 className="text-lg font-bold text-foreground mb-2">
              {t("orderTrackingPage.needHelp")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("orderTrackingPage.contactSupport")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <a
                href="tel:+8801234567890"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-bold transition-colors"
              >
                {t("orderTrackingPage.callSupport")}
              </a>
              <a
                href="mailto:support@online24pharmacy.com"
                className="bg-background text-foreground border border-border px-6 py-3 rounded-xl font-bold hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {t("orderTrackingPage.emailUs")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
