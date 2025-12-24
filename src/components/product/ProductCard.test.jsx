// Silence React Router v7 future flag warnings in this test file
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes(
        "React Router will begin wrapping state updates in `React.startTransition`"
      ) ||
        args[0].includes(
          "Relative route resolution within Splat routes is changing in v7"
        ))
    ) {
      return;
    }
    originalWarn(...args);
  };
});
afterAll(() => {
  console.warn = originalWarn;
});
// src/components/product/ProductCard.test.jsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import ProductCard from "./ProductCard";

// Mock the cart store
vi.mock("../../stores/cartStore", () => ({
  useCartStore: vi.fn(() => vi.fn()),
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("ProductCard", () => {
  const mockProduct = {
    id: "1",
    name: "Test Product",
    category: { name: "Test Brand" },
    price: 100,
    discountPrice: 80,
    images: ["/test-image.jpg"],
    stockQuantity: 5,
    isPrescriptionRequired: true,
  };

  it("renders product details correctly", () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    // Check for product name
    expect(screen.getByText("Test Product")).toBeInTheDocument();

    // Check for category
    expect(screen.getByText("Test Brand")).toBeInTheDocument();

    // Check for discounted price
    expect(screen.getByText("৳80")).toBeInTheDocument();

    // Check for original price (line-through)
    expect(screen.getByText("৳100")).toBeInTheDocument();

    // Check for prescription required badge
    expect(screen.getByText("Rx")).toBeInTheDocument();
  });

  it("renders the Add to Cart button", () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    const addButton = screen.getByRole("button");
    expect(addButton).toBeInTheDocument();
    expect(addButton).not.toBeDisabled();
  });

  it("shows Out of Stock when stock is zero", () => {
    const outOfStockProduct = { ...mockProduct, stockQuantity: 0 };
    renderWithRouter(<ProductCard product={outOfStockProduct} />);
    const addButton = screen.getByRole("button");
    expect(addButton).toBeDisabled();
  });
});
