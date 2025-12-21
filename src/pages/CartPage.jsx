import SEOHead from "../components/common/SEOHead";
import CartHeader from "../components/cart/CartHeader";
import EmptyCart from "../components/cart/EmptyCart";
import CartItem from "../components/cart/CartItem";
import OrderSummary from "../components/cart/OrderSummary";
import { useCartStore } from "../stores/cartStore";
import { DELIVERY } from "../utils/constants";

export default function CartPage() {
  const cart = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  if (cart.length === 0) {
    return (
      <>
        <SEOHead title="Shopping Cart - Online24 Pharma" />
        <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CartHeader itemCount={0} />
            <EmptyCart />
          </div>
        </div>
      </>
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const delivery = subtotal >= DELIVERY.FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY.DEFAULT_SHIPPING_COST;
  const total = subtotal + delivery;
  
  const hasPrescriptionItems = cart.some((item) => item.product?.requiresPrescription);
  const canCheckout = !hasPrescriptionItems || cart.every((item) => !item.product?.requiresPrescription || item.prescriptionUploaded);

  return (
    <>
      <SEOHead title="Shopping Cart - Online24 Pharma" />
      <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CartHeader itemCount={cart.length} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-6">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <div className="lg:col-span-1">
              <OrderSummary
                subtotal={subtotal}
                delivery={delivery}
                total={total}
                canCheckout={canCheckout}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
