import { useEffect, useState, useRef } from "react";
import "./order-confirmation-print.css";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircleIcon,
  PrinterIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";
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
  const printRef = useRef();

  // ...existing code...

  // Automatically print invoice after payment/redirect, only on first load
  useEffect(() => {
    if (!loading && !error && order) {
      // DISABLED: Only print if navigated from payment/checkout (not on every mount)
      // const printed = sessionStorage.getItem("orderInvoicePrinted");
      // if (!printed) {
      //   setTimeout(() => {
      //     handlePrint();
      //     sessionStorage.setItem("orderInvoicePrinted", "true");
      //   }, 500);
      // }
    }
    // Reset flag if leaving page
    return () => {
      sessionStorage.removeItem("orderInvoicePrinted");
    };
  }, [loading, error, order]);

  // ...existing code...

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await orderApi.getById(orderId);
        setOrder(response);
      } catch (err) {
        console.error("Fetch order error:", err);
        const errorMessage =
          err.response?.data?.error ||
          err.message ||
          t("orderConfirmationPage.failedToLoadOrder");
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, t]);

  const handlePrint = () => {

    if (!printRef.current) {
      console.error("Print ref not found");
      alert("Print reference not found. Please try again.");
      return;
    }



    // Create a new window for printing
    const printWindow = window.open("", "_blank", "width=800,height=600");

    if (!printWindow) {
      alert("Please allow popups for this site to print the order summary.");
      return;
    }

    // Get the content to print
    const printContent = printRef.current.innerHTML;

    // Create the HTML for printing
    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Summary - ${order?.orderNumber || "Order"}</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 0.5in;
            }

            body, html {
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
              color: #000 !important;
              font-family: Arial, sans-serif !important;
              font-size: 12px !important;
              line-height: 1.4 !important;
            }

            * {
              box-sizing: border-box !important;
            }

            .bg-card, .bg-background {
              background: #fff !important;
            }

            .shadow-lg, .shadow-sm, .border, .rounded-2xl, .rounded-xl {
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
            }

            .text-primary { color: #000 !important; }
            .text-foreground { color: #000 !important; }
            .text-muted-foreground { color: #666 !important; }

            table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 15px 0 !important;
              font-size: 11px !important;
            }

            th, td {
              border: 1px solid #000 !important;
              padding: 8px 4px !important;
              text-align: left !important;
              vertical-align: top !important;
            }

            th {
              background: #f0f0f0 !important;
              font-weight: bold !important;
            }

            .grid, .flex {
              display: block !important;
              width: 100% !important;
            }

            .hidden { display: none !important; }

            h1, h2, h3 {
              color: #000 !important;
              font-weight: bold !important;
              margin: 10px 0 !important;
              page-break-after: avoid !important;
            }

            h2 {
              font-size: 18px !important;
              border-bottom: 2px solid #000 !important;
              padding-bottom: 5px !important;
            }

            p, span, div {
              color: #000 !important;
              margin: 5px 0 !important;
            }

            .font-bold { font-weight: bold !important; }
            .font-semibold { font-weight: bold !important; }
            .text-right { text-align: right !important; }
            .text-center { text-align: center !important; }
          }

          /* Screen styles */
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: #fff;
            color: #000;
          }

          .print-content {
            max-width: 100%;
            margin: 0;
            padding: 20px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <div class="print-content">
          ${printContent}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    // Write to the new window
    printWindow.document.write(printHTML);
    printWindow.document.close();

  };

  if (loading) {
    return (
      <>
        <SEOHead
          title={t("orderConfirmationPage.loading", "Loading order details...")}
        />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <LoadingSpinner size="lg" text={t("orderConfirmationPage.loading")} />
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <SEOHead title={t("order.notFound")} />
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4">
              {t("order.notFound", "Order not found.")}
            </h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>{t("order.backToHome")}</span>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const items = order.orderItems || [];
  const subtotal = items.reduce((acc, item) => {
    const price = Number(item.unitPrice ?? item.price) || 0;
    return acc + price * item.quantity;
  }, 0);
  const totalAmount = Number(order.totalAmount) || 0;
  const deliveryFee = totalAmount - subtotal;

  return (
    <>
      <SEOHead
        title={`${t("order.confirmation", "Order Confirmed")} #${order.orderNumber}`}
      />
      <div className="bg-background min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        {/* Header and Action Buttons (not printed) */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 no-print">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              {t("order.thankYou", "Thank you for your order!")}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {t(
                "order.yourOrderIsConfirmed",
                "Your order has been confirmed.",
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 no-print">
            <Link
              to={`/track-order?orderId=${order.orderNumber}`}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              <span>{t("order.trackYourOrder", "Track your order")}</span>
            </Link>
            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 bg-card text-foreground px-5 py-2.5 rounded-lg font-semibold hover:bg-muted/50 border border-border transition-colors shadow-sm"
            >
              <PrinterIcon className="w-5 h-5" />
              <span>{t("order.printSummary", "Print Order Summary")}</span>
            </button>
          </div>
          {/* Printable Order Summary */}
          <div ref={printRef} className="print-area">
            <div className="bg-card rounded-2xl shadow-lg border border-border/70 p-6 sm:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 items-center mb-8">
                <div className="sm:col-span-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("order.summary", "Order Summary")}
                  </h2>
                  <p className="text-muted-foreground">
                    {t("order.number", "Order Number")}:{" "}
                    <span className="font-mono text-primary">
                      #{order.orderNumber}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {t("order.placedOn", "Placed On")}
                  </p>
                  <p className="font-semibold text-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {/* Order Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left table-auto">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="px-4 py-3 font-semibold text-muted-foreground text-sm">
                        {t("order.product", "Product")}
                      </th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground text-sm text-center">
                        {t("order.quantity", "Quantity")}
                      </th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground text-sm text-right">
                        {t("order.unitPrice", "Unit Price")}
                      </th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground text-sm text-right">
                        {t("order.total", "Total")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const price = Number(item.unitPrice ?? item.price) || 0;
                      return (
                        <tr key={item.id} className="border-b border-border/50">
                          <td className="p-4">
                            <p className="font-medium text-foreground">
                              {item.product?.name ||
                                item.productName ||
                                "Product 1"}
                            </p>
                          </td>
                          <td className="p-4 text-center text-muted-foreground">
                            {item.quantity}
                          </td>
                          <td className="p-4 text-right font-medium text-foreground">
                            ৳{price.toFixed(2)}
                          </td>
                          <td className="p-4 text-right font-medium text-foreground">
                            ৳{(price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Totals Section */}
              <div className="mt-8 max-w-sm ml-auto space-y-3">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>{t("order.subtotal", "Subtotal")}</span>
                  <span className="font-medium text-foreground">
                    ৳{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>{t("order.deliveryFee", "Delivery Fee")}</span>
                  <span className="font-medium text-foreground">
                    ৳{deliveryFee.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-border/70 my-2" />
                <div className="flex justify-between items-center text-lg font-bold text-primary">
                  <span>{t("order.total", "Total")}</span>
                  <span>৳{totalAmount.toFixed(2)}</span>
                </div>
              </div>
              {/* Shipping & Payment Info */}
              <div className="mt-8 pt-6 border-t border-border/70 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {t("order.shippingTo", "Shipping To")}
                  </h3>
                  <div className="text-muted-foreground space-y-1">
                    <p>{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>
                      {order.shippingAddress.area}, {order.shippingAddress.city}
                    </p>
                    <p>{order.shippingAddress.phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {t("order.paymentMethod", "Payment Method")}
                  </h3>
                  <p className="text-muted-foreground capitalize">
                    {order.paymentMethod
                      ? order.paymentMethod.replace("_", " ")
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-8 no-print">
            <Link
              to="/"
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("order.continueShopping", "Continue Shopping")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}