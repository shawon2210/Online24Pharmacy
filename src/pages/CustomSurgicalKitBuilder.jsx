import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import SEOHead from "../components/common/SEOHead";
import {
  PlusIcon,
  TrashIcon,
  ShareIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { useCartStore } from "../stores/cartStore";
import axios from "axios";
import { CSS } from "@dnd-kit/utilities";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const useCases = {
  "Post-Surgery Care": [
    "Gauze",
    "Antiseptic",
    "Medical Tape",
    "Pain Relievers",
  ],
  "Diabetic Wound Kit": ["Gauze", "Antiseptic", "Saline Solution", "Bandages"],
  "First Aid for Home": [
    "Bandages",
    "Antiseptic Wipes",
    "Gauze",
    "Adhesive Tape",
    "Scissors",
  ],
};

const ProductItem = ({ product, onAdd }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: product.id,
    data: { product },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center mb-2"
    >
      <div
        {...listeners}
        {...attributes}
        className="flex-1 cursor-move touch-none"
      >
        <p className="font-semibold text-gray-800">{product.name}</p>
        <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
      </div>
      <button
        onClick={() => onAdd(product)}
        className="text-emerald-500 hover:text-emerald-700"
      >
        <PlusIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

const KitItem = ({ item, onRemove }) => {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center mb-2">
      <div>
        <p className="font-semibold text-gray-800">{item.name}</p>
        <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
      </div>
      <button
        onClick={() => onRemove(item.instanceId)}
        className="text-red-500 hover:text-red-700"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default function CustomSurgicalKitBuilder() {
  const { t: _t } = useTranslation();
  const { user, token } = useAuth();
  const { addItem, clearCart } = useCartStore();
  const [kitItems, setKitItems] = useState([]);
  const [kitName, setKitName] = useState("My Custom Kit");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      return data.products || [];
    },
  });

  const sensors = useSensors(useSensor(PointerSensor));

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const addToKit = (product) => {
    if (!kitItems.find((item) => item.id === product.id)) {
      setKitItems((prev) => [
        ...prev,
        { ...product, instanceId: `${product.id}-${Date.now()}` },
      ]);
    } else {
      toast.error("This item is already in your kit.");
    }
  };

  const handleDragStart = () => setIsDragging(true);

  const handleDragEnd = (event) => {
    setIsDragging(false);
    const { over, active } = event;
    if (over && over.id === "kit-drop-zone") {
      const product = active.data.current.product;
      addToKit(product);
    }
  };

  const removeFromKit = (instanceId) => {
    setKitItems((prev) =>
      prev.filter((item) => item.instanceId !== instanceId)
    );
  };

  const clearKit = () => setKitItems([]);

  const selectUseCase = (useCase) => {
    const newItems = products.filter((p) => useCases[useCase].includes(p.name));
    const uniqueNewItems = newItems.filter(
      (newItem) => !kitItems.some((kitItem) => kitItem.id === newItem.id)
    );
    setKitItems((prev) => [
      ...prev,
      ...uniqueNewItems.map((item) => ({
        ...item,
        instanceId: `${item.id}-${Date.now()}`,
      })),
    ]);
  };

  const totalPrice = useMemo(() => {
    return kitItems.reduce((total, item) => total + item.price, 0);
  }, [kitItems]);

  const saveKit = async () => {
    if (!user) {
      toast.error("You must be logged in to save a kit.");
      return;
    }
    if (kitItems.length === 0) {
      toast.error("Your kit is empty.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/kits`,
        {
          name: kitName,
          products: kitItems.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 201) {
        toast.success("Kit saved successfully!");
      }
    } catch (error) {
      toast.error("Failed to save kit.");
      console.error(error);
    }
  };

  const shareKit = () => {
    if (kitItems.length === 0) {
      toast.error("Cannot share an empty kit.");
      return;
    }
    const itemIds = kitItems.map((item) => item.id).join(",");
    const url = `${window.location.origin}/build-a-kit?items=${itemIds}`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied to clipboard!");
  };

  const addKitToCart = () => {
    if (kitItems.length === 0) {
      toast.error("Your kit is empty. Add items first.");
      return;
    }

    // Clear cart first to remove any old custom kit items
    clearCart();

    // Add each kit item individually to cart with proper product structure
    kitItems.forEach((item) => {
      const product = {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.images?.[0] || item.image || "/icon-512x512.png",
        images: item.images || [item.image] || ["/icon-512x512.png"],
      };
      addItem(product, 1);
    });

    toast.success(`${kitName} (${kitItems.length} items) added to cart!`);
  };

  const { isOver, setNodeRef } = useDroppable({ id: "kit-drop-zone" });

  return (
    <>
      <SEOHead
        title="Custom Surgical Kit Builder"
        description="Build your own surgical kit for home care."
      />
      <div className="bg-gray-50 min-h-screen">
        <div className="w-full mx-auto px-4 sm:px-6 md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
          <div className="py-12">
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  Custom Surgical Kit Builder
                </span>
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Create a personalized kit for your specific healthcare needs.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                1. Start with a Template (Optional)
              </h2>
              <div className="flex flex-wrap gap-3">
                {Object.keys(useCases).map((useCase) => (
                  <button
                    key={useCase}
                    onClick={() => selectUseCase(useCase)}
                    className="bg-white border-2 border-gray-200 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-all duration-200 shadow-sm"
                  >
                    {useCase}
                  </button>
                ))}
              </div>
            </div>

            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Available Items */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    2. Available Items
                  </h2>
                  <div className="relative mb-4">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg h-96 overflow-y-auto">
                    {isLoading ? (
                      <p>Loading...</p>
                    ) : (
                      filteredProducts.map((product) => (
                        <ProductItem
                          key={product.id}
                          product={product}
                          onAdd={addToKit}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Your Custom Kit */}
                <div
                  ref={setNodeRef}
                  className={`p-6 rounded-2xl shadow-lg border-2 transition-colors duration-300 ${
                    isOver
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                      3. Your Custom Kit
                    </h2>
                    {kitItems.length > 0 && (
                      <button
                        onClick={clearKit}
                        className="text-sm font-semibold text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <XMarkIcon className="w-4 h-4" /> Clear All
                      </button>
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-lg h-96 overflow-y-auto transition-colors ${
                      isDragging ? "bg-emerald-50/50" : "bg-gray-50"
                    }`}
                  >
                    {kitItems.length > 0 ? (
                      kitItems.map((item) => (
                        <KitItem
                          key={item.instanceId}
                          item={item}
                          onRemove={removeFromKit}
                        />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <ShoppingBagIcon className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="font-semibold">Your kit is empty</p>
                        <p className="text-sm">
                          Drag items here or use the '+' button to add them.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DndContext>

            {/* Finalize Kit Section */}
            <div className="mt-10 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                4. Finalize Your Kit
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                <input
                  type="text"
                  value={kitName}
                  onChange={(e) => setKitName(e.target.value)}
                  className="flex-1 min-w-[200px] border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  placeholder="Enter a name for your kit"
                />
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Total Items</p>
                    <p className="text-lg font-bold text-gray-800">
                      {kitItems.length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Total Price</p>
                    <p className="text-lg font-bold text-emerald-600">
                      ${totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 ml-auto">
                  <button
                    onClick={addKitToCart}
                    className="btn-primary flex items-center gap-2"
                  >
                    <ShoppingCartIcon className="w-5 h-5" /> Add to Cart
                  </button>
                  <button
                    onClick={saveKit}
                    className="btn-primary flex items-center gap-2"
                  >
                    <CheckCircleIcon className="w-5 h-5" /> Save
                  </button>
                  <button
                    onClick={shareKit}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <ShareIcon className="w-5 h-5" /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
