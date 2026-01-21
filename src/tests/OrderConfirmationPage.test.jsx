import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import OrderConfirmationPage from "../pages/OrderConfirmationPage";
import { orderApi } from "../utils/apiClient";

// Mock the order API
vi.mock("../utils/apiClient", () => ({
  orderApi: {
    getById: vi.fn(),
  },
}));

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

const mockOrder = {
  id: "123",
  orderNumber: "ORD123",
  totalAmount: 150.0,
  paymentMethod: "cod",
  createdAt: new Date().toISOString(),
  orderItems: [
    {
      id: "item1",
      productName: "Product 1",
      price: 50.0,
      quantity: 2,
    },
    {
      id: "item2",
      productName: "Product 2",
      price: 50.0,
      quantity: 1,
    },
  ],
  shippingAddress: {
    fullName: "John Doe",
    address: "123 Main St",
    area: "Downtown",
    city: "Dhaka",
    phone: "01234567890",
  },
};

describe("OrderConfirmationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", async () => {
    orderApi.getById.mockResolvedValue(mockOrder);
    // Wrap in act to avoid warning
    await waitFor(() => {
      render(
        <MemoryRouter initialEntries={["/order/confirmation/123"]}>
          <Routes>
            <Route
              path="/order/confirmation/:orderId"
              element={<OrderConfirmationPage />}
            />
          </Routes>
        </MemoryRouter>,
      );
      expect(
        screen.getByText("orderConfirmationPage.loading"),
      ).toBeInTheDocument();
    });
  });

  it("should render order details after successful fetch", async () => {
    orderApi.getById.mockResolvedValue(mockOrder);
    // Wrap in act to avoid warning
    await waitFor(() => {
      render(
        <MemoryRouter initialEntries={["/order/confirmation/123"]}>
          <Routes>
            <Route
              path="/order/confirmation/:orderId"
              element={<OrderConfirmationPage />}
            />
          </Routes>
        </MemoryRouter>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("#ORD123")).toBeInTheDocument();
    });

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
    expect(screen.getByText("order.printSummary")).toBeInTheDocument();
  });

  it("should render error state on fetch failure", async () => {
    const errorMessage = "Failed to fetch";
    orderApi.getById.mockRejectedValue({ message: errorMessage });
    const originalError = console.error;
    console.error = vi.fn();
    await waitFor(() => {
      render(
        <MemoryRouter initialEntries={["/order/confirmation/123"]}>
          <Routes>
            <Route
              path="/order/confirmation/:orderId"
              element={<OrderConfirmationPage />}
            />
          </Routes>
        </MemoryRouter>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("order.notFound")).toBeInTheDocument();
    });
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    console.error = originalError;
  });
});
