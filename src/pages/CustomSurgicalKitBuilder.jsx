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
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const useCases = {
  "Post-Surgery Care": [
    "Gauze",
    "Antiseptic",
    "Medical Tape",
    "Pain Relievers",
  ],
  "Diabetic Wound Kit": [
    "Gauze",
    "Antiseptic",
    "Saline Solution",
    "Bandages",
  ],
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
      className="bg-card p-3 rounded-lg shadow-sm flex justify-between items-center mb-2 border border-border hover:shadow-md transition-shadow"
    >
      <div
        {...listeners}
        {...attributes}
        className="flex-1 cursor-move touch-none"
      >
        <p className="font-semibold text-foreground">{product.name}</p>
        <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
      </div>
      <button
        onClick={() => onAdd(product)}
        className="text-primary hover:opacity-80 transition-opacity"
      >
        <PlusIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

const KitItem = ({ item, onRemove }) => {
  return (
    <div className="bg-card p-3 rounded-lg shadow-sm flex justify-between items-center mb-2 border border-border hover:shadow-md transition-shadow">
      <div>
        <p className="font-semibold text-foreground">{item.name}</p>
        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
      </div>
      <button
        onClick={() => onRemove(item.instanceId)}
        className="text-red-600 hover:opacity-80 transition-opacity"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default function CustomSurgicalKitBuilder() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const { addItem, clearCart } = useCartStore();
  const [kitItems, setKitItems] = useState([]);
  const [kitName, setKitName] = useState(t("customKitBuilder.myCustomKit"));
  const [searchTerm, setSearchTerm] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) throw new Error(t("customKitBuilder.fetchProductsError"));
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
      toast.error(t("customKitBuilder.itemAlreadyInKit"));
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
      toast.error(t("customKitBuilder.loginToSave"));
      return;
    }
    if (kitItems.length === 0) {
      toast.error(t("customKitBuilder.kitEmpty"));
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
        toast.success(t("customKitBuilder.kitSaved"));
      }
    } catch (error) {
      toast.error(t("customKitBuilder.saveKitError"));
      console.error(error);
    }
  };

  const shareKit = () => {
    if (kitItems.length === 0) {
      toast.error(t("customKitBuilder.shareEmptyKitError"));
      return;
    }
    const itemIds = kitItems.map((item) => item.id).join(",");
    const url = `${window.location.origin}/build-a-kit?items=${itemIds}`;
    navigator.clipboard.writeText(url);
    toast.success(t("customKitBuilder.shareLinkCopied"));
  };

  const addKitToCart = () => {
    if (kitItems.length === 0) {
      toast.error(t("customKitBuilder.addEmptyKitError"));
      return;
    }

    clearCart();

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

    toast.success(
      t("customKitBuilder.kitAddedToCart", { kitName, count: kitItems.length })
    );
  };

  const { isOver, setNodeRef } = useDroppable({ id: "kit-drop-zone" });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("customKitBuilder.seoTitle")}
        description={t("customKitBuilder.seoDescription")}
        url="/build-kit"
      />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md shadow-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          {/* Professional Breadcrumbs */}
          <nav className="mb-3" aria-label={t("breadcrumb")}>
            <ol className="flex items-center gap-1 text-sm text-foreground">
              <li>
                <a href="/" className="hover:text-primary font-medium">
                  {t("home")}
                </a>
              </li>
              <li className="px-1 text-muted-foreground">/</li>
              <li className="text-foreground font-bold" aria-current="page">
                {t("customKitBuilder.title")}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-primary mb-1">
                {t("customKitBuilder.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("customKitBuilder.subtitle")}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary/30 text-primary rounded-full text-sm font-bold">
              <ShoppingBagIcon className="w-5 h-5" />
              <span>{kitItems.length} {t("items")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Templates Section */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-6 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            {t("customKitBuilder.quickStartTemplates")}
          </h2>
          <div className="flex flex-wrap gap-3">
            {Object.keys(useCases).map((useCase) => (
              <button
                key={useCase}
                onClick={() => selectUseCase(useCase)}
                className="px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-primary/10 hover:text-primary transition-colors border border-border"
              >
                {t(`customKitBuilder.useCases.${useCase.replace(/\s+/g, "")}`)}
              </button>
            ))}
          </div>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Items */}
            <div className="bg-card rounded-xl shadow-lg border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                {t("customKitBuilder.availableItems")}
              </h2>
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("customKitBuilder.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <div className="bg-muted rounded-lg p-4 h-96 overflow-y-auto border border-border">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
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
              className={`rounded-xl shadow-lg border-2 p-6 transition-all duration-300 ${
                isOver
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ShoppingBagIcon className="w-5 h-5 text-primary" />
                  {t("customKitBuilder.yourCustomKit")}
                </h2>
                {kitItems.length > 0 && (
                  <button
                    onClick={clearKit}
                    className="text-sm font-medium text-red-600 hover:opacity-80 flex items-center gap-1 transition-opacity"
                  >
                    <XMarkIcon className="w-4 h-4" /> {t("clearAll")}
                  </button>
                )}
              </div>
              <div
                className={`rounded-lg p-4 h-96 overflow-y-auto transition-colors border border-border ${
                  isDragging
                    ? "bg-primary/5"
                    : "bg-muted"
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
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <ShoppingBagIcon className="w-16 h-16 text-muted mb-4" />
                    <p className="font-semibold text-foreground">
                      {t("customKitBuilder.kitEmpty")}
                    </p>
                    <p className="text-sm">
                      {t("customKitBuilder.dragAndDrop")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DndContext>

        {/* Finalize Kit Section */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-6 mt-6">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-primary" />
            {t("customKitBuilder.finalizeKit")}
          </h2>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1">
              <input
                type="text"
                value={kitName}
                onChange={(e) => setKitName(e.target.value)}
                className="w-full border border-border rounded-lg p-3 bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder={t("customKitBuilder.kitNamePlaceholder")}
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-medium">
                  {t("items")}
                </p>
                <p className="text-lg font-bold text-foreground">
                  {kitItems.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-medium">
                  {t("total")}
                </p>
                <p className="text-lg font-bold text-primary">
                  ${totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={addKitToCart}
                className="bg-primary hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold transition-opacity flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <ShoppingCartIcon className="w-5 h-5" /> {t("addToCart")}
              </button>
              <button
                onClick={saveKit}
                className="bg-blue-600 hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold transition-opacity flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <CheckCircleIcon className="w-5 h-5" /> {t("customKitBuilder.saveKit")}
              </button>
              <button
                onClick={shareKit}
                className="bg-muted-foreground hover:opacity-80 text-background px-6 py-3 rounded-lg font-semibold transition-opacity flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <ShareIcon className="w-5 h-5" /> {t("share")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
