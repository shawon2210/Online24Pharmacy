import { useState } from "react";
import { CalendarIcon, TruckIcon } from "@heroicons/react/24/outline";

export default function SubscriptionOption({ product }) {
  const [subscriptionType, setSubscriptionType] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  if (!product.allowsSubscription) return null;

  const subscriptionOptions = [
    { value: "weekly", label: "Weekly", discount: 5 },
    { value: "monthly", label: "Monthly", discount: 10 },
    { value: "quarterly", label: "Every 3 Months", discount: 15 },
  ];

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      // API call to create subscription
      console.log("Creating subscription:", {
        productId: product.id,
        type: subscriptionType,
      });
      // Redirect to subscription checkout
    } catch (error) {
      console.error("Subscription failed:", error);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="bg-background dark:bg-card border border-border dark:border-foreground rounded-lg p-4 mt-4">
      <div className="flex items-center mb-3">
        <CalendarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2" />
        <h3 className="font-semibold text-foreground dark:text-background">
          Subscribe & Save
        </h3>
      </div>

      <p className="text-sm text-blue-700 mb-4">
        Perfect for chronic conditions. Never run out of your essential
        medicines.
      </p>

      <div className="space-y-2 mb-4">
        {subscriptionOptions.map((option) => (
          <label
            key={option.value}
            className="flex items-center cursor-pointer"
          >
            <input
              type="radio"
              name="subscription"
              value={option.value}
              checked={subscriptionType === option.value}
              onChange={(e) => setSubscriptionType(e.target.value)}
              className="mr-3"
            />
            <div className="flex-1 flex justify-between items-center">
              <span className="text-sm font-medium">
                {option.label} Delivery
              </span>
              <div className="text-right">
                <span className="text-sm text-green-600 font-medium">
                  {option.discount}% OFF
                </span>
                <div className="text-xs text-muted-foreground">
                  ৳
                  {(
                    (product.discountPrice || product.price) *
                    (1 - option.discount / 100)
                  ).toFixed(0)}
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="flex items-center text-xs text-muted-foreground mb-3">
        <TruckIcon className="w-4 h-4 mr-1" />
        <span>Free delivery • Cancel anytime • Skip deliveries</span>
      </div>

      <button
        onClick={handleSubscribe}
        disabled={!subscriptionType || isSubscribing}
        className="w-full bg-linear-to-r from-emerald-600 to-cyan-600 text-background py-2 px-4 rounded-md hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-50 text-sm font-medium transition-all duration-300"
      >
        {isSubscribing ? "Setting up..." : "Subscribe Now"}
      </button>
    </div>
  );
}
