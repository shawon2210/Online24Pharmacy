/**
 * STATE MANAGEMENT EXAMPLES
 * Demonstrates proper usage of different state management approaches
 */

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCartStore } from "../../stores/cartStore";
import { useAuth } from "../../contexts/AuthContext";

// Example 1: Local State for UI
function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("details");
  const { t } = useTranslation();
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        {t("openModal", "Open Modal")}
      </button>
      {isOpen && (
        <div className="modal">
          <button onClick={() => setSelectedTab("details")}>
            {t("details", "Details")}
          </button>
          <button onClick={() => setSelectedTab("reviews")}>
            {t("reviews", "Reviews")}
          </button>
          {selectedTab === "details" && (
            <div>{t("detailsContent", "Details content")}</div>
          )}
          {selectedTab === "reviews" && (
            <div>{t("reviewsContent", "Reviews content")}</div>
          )}
          <button onClick={() => setIsOpen(false)}>
            {t("close", "Close")}
          </button>
        </div>
      )}
    </div>
  );
}

// Example 2: Zustand for Global State
function CartBadge() {
  const items = useCartStore((state) => state.items);

  const itemCount = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  return <div className="cart-badge">🛒 {itemCount}</div>;
}

// Example 3: Context API for Auth
function UserProfile() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  if (!isAuthenticated) {
    return <div>{t("pleaseLogin", "Please log in")}</div>;
  }
  return (
    <div className="user-profile">
      <h2>
        {t("welcome", "Welcome")}, {user.firstName}!
      </h2>
      <button onClick={logout}>{t("logout", "Logout")}</button>
    </div>
  );
}

// Example 4: Combined State Management
function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const totalPrice = useMemo(() => {
    return product.price * quantity;
  }, [product.price, quantity]);
  const handleAddToCart = () => {
    if (!isAuthenticated) return;
    addItem(product, quantity);
    setQuantity(1);
  };
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>৳{product.price}</p>
      <div>
        <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
          -
        </button>
        <span>{quantity}</span>
        <button onClick={() => setQuantity((q) => q + 1)}>+</button>
      </div>
      <p>
        {t("total", "Total")}: ৳{totalPrice.toFixed(2)}
      </p>
      <button onClick={handleAddToCart}>{t("addToCart", "Add to Cart")}</button>
      <button onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? t("hide", "Hide") : t("show", "Show")}{" "}
        {t("details", "Details")}
      </button>
      {showDetails && <div>{product.description}</div>}
    </div>
  );
}

export { ModalExample, CartBadge, UserProfile, ProductCard };
