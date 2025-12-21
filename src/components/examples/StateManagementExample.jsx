/**
 * STATE MANAGEMENT EXAMPLES
 * Demonstrates proper usage of different state management approaches
 */

import { useState, useMemo } from "react";
import { useCartStore } from "../../stores/cartStore";
import { useAuth } from "../../contexts/AuthContext";

// Example 1: Local State for UI
function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("details");

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      {isOpen && (
        <div className="modal">
          <button onClick={() => setSelectedTab("details")}>Details</button>
          <button onClick={() => setSelectedTab("reviews")}>Reviews</button>
          {selectedTab === "details" && <div>Details content</div>}
          {selectedTab === "reviews" && <div>Reviews content</div>}
          <button onClick={() => setIsOpen(false)}>Close</button>
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

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div className="user-profile">
      <h2>Welcome, {user.firstName}!</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// Example 4: Combined State Management
function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { isAuthenticated } = useAuth();
  
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
        <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
        <span>{quantity}</span>
        <button onClick={() => setQuantity(q => q + 1)}>+</button>
      </div>
      <p>Total: ৳{totalPrice.toFixed(2)}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
      <button onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? "Hide" : "Show"} Details
      </button>
      {showDetails && <div>{product.description}</div>}
    </div>
  );
}

export { ModalExample, CartBadge, UserProfile, ProductCard };
