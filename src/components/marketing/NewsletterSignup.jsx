import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { subscribeNewsletter } from "../../utils/api";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: subscribeNewsletter,
    onSuccess: () => {
      setIsSubscribed(true);
      setEmail("");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      subscribeMutation.mutate({ email: email.trim() });
    }
  };

  if (isSubscribed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <EnvelopeIcon className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Successfully Subscribed!
        </h3>
        <p className="text-green-700">
          Thank you for subscribing to our newsletter. You'll receive health
          tips and exclusive offers.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <EnvelopeIcon className="w-6 h-6 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-emerald-900 mb-2">
          Stay Updated with Health Tips
        </h3>
        <p className="text-emerald-700 text-sm">
          Get exclusive offers, health advice, and medicine reminders delivered
          to your inbox.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
          required
        />
        <button
          type="submit"
          disabled={subscribeMutation.isPending}
          className="px-4 py-2 bg-emerald-600 text-background rounded-md hover:bg-emerald-700 disabled:opacity-50 text-sm"
        >
          {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {subscribeMutation.isError && (
        <p className="text-red-600 text-sm mt-2">
          Failed to subscribe. Please try again.
        </p>
      )}

      <div className="mt-3 text-xs text-muted-foreground">
        <p>✓ Weekly health tips</p>
        <p>✓ Exclusive discounts</p>
        <p>✓ Medicine reminders</p>
        <p>✓ Unsubscribe anytime</p>
      </div>
    </div>
  );
}
