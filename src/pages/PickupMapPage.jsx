import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
// Helper component to pan/zoom to selected shop
function MapPanToShop({ shop, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    if (shop && typeof shop.lat === "number" && typeof shop.lng === "number") {
      map.setView([shop.lat, shop.lng], zoom, { animate: true });
    }
  }, [shop, zoom, map]);
  return null;
}
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import SEOHead from "../components/common/SEOHead";
import { useTranslation } from "react-i18next";
import {
  MapPinIcon,
  BuildingStorefrontIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const PickupMapPage = () => {
  const { t } = useTranslation();
  const [mapCenter, setMapCenter] = useState({ lat: 23.8103, lng: 90.4125 }); // Dhaka default
  const [mapZoom, setMapZoom] = useState(10);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("productId");

  // Geocode address using a public service as a fallback
  const geocodeAddress = useCallback(async (address) => {
    // Note: Using a public geocoding service is not recommended for production.
    // It's better to ensure that the data in the database has correct lat/lng values.
    console.warn("Geocoding address:", address);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&limit=1`
      );
      if (!resp.ok) return null;
      const results = await resp.json();
      if (!results || results.length === 0) return null;
      return {
        lat: parseFloat(results[0].lat),
        lng: parseFloat(results[0].lon),
      };
    } catch {
      return null;
    }
  }, []);

  const fetchShops = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (productId && /^[a-zA-Z0-9_-]+$/.test(productId)) {
        params.append("productId", productId);
      }
      const url = `/api/pickup-locations${
        params.toString() ? "?" + params.toString() : ""
      }`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          t("pickupMapPage.failedToLoad", {
            defaultValue: "Failed to load pickup locations",
          })
        );
      }
      const data = await response.json();

      const normalized = await Promise.all(
        (data || []).map(async (shop) => {
          let { lat, lng } = shop;
          lat = typeof lat === "string" ? parseFloat(lat) : lat;
          lng = typeof lng === "string" ? parseFloat(lng) : lng;

          // If lat or lng are not valid numbers, try to geocode the address
          if (isNaN(lat) || isNaN(lng)) {
            const geo = await geocodeAddress(shop.address || shop.name || "");
            if (geo) {
              lat = geo.lat;
              lng = geo.lng;
            }
          }

          if (typeof lat === "number" && typeof lng === "number") {
            // This is a hack to fix swapped lat/lng values.
            // It's better to fix the data at the source.
            if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
              [lat, lng] = [lng, lat];
            }
            if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
            return { ...shop, lat, lng };
          }
          return null;
        })
      );

      setShops(normalized.filter(Boolean));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [geocodeAddress, productId, t]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Update map center/zoom when shops change
  useEffect(() => {
    if (shops.length === 1) {
      setMapCenter({ lat: shops[0].lat, lng: shops[0].lng });
      setMapZoom(13);
    } else if (shops.length > 1) {
      // Center to first shop, or you can calculate bounds if needed
      setMapCenter({ lat: shops[0].lat, lng: shops[0].lng });
      setMapZoom(10);
    }
  }, [shops]);

  const renderHeader = () => {
    // TODO: Replace with real admin check if available
    const isAdmin =
      window.location.pathname.startsWith("/admin") ||
      window.localStorage.getItem("isAdmin") === "true";
    return (
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md shadow-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="mb-3" aria-label={t("breadcrumb")}>
            <ol className="flex items-center gap-1 text-sm text-foreground">
              <li>
                <a href="/" className="hover:text-primary font-medium">
                  {t("home")}
                </a>
              </li>
              <li className="px-1 text-muted-foreground">/</li>
              <li className="text-foreground font-bold" aria-current="page">
                {t("pickupMapPage.title")}
              </li>
            </ol>
          </nav>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-primary mb-1">
                {t("pickupMapPage.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("pickupMapPage.subtitle")}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary/30 text-primary rounded-full text-sm font-bold">
                <BuildingStorefrontIcon className="w-5 h-5" />
                <span>
                  {shops.length} {t("pickupMapPage.shops")}
                </span>
              </div>
              <button
                type="button"
                onClick={fetchShops}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary/30 text-primary rounded-full text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                title={t("pickupMapPage.refresh")}
              >
                <ArrowPathIcon className="w-5 h-5" />
                <span>{t("pickupMapPage.refresh")}</span>
              </button>
              {isAdmin && (
                <a
                  href="/admin/shops"
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground border-2 border-accent rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
                  title="Go to Shop Admin Panel"
                >
                  <BuildingStorefrontIcon className="w-5 h-5" />
                  <span>Admin: Upload Shops</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={t("pickupMapPage.seoTitle")}
        description={t("pickupMapPage.seoDescription")}
        url="/pickup-map"
      />
      {renderHeader()}

      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-300px">
            <div className="text-center bg-card rounded-2xl shadow-lg border border-border p-8 w-full max-w-md mx-auto">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-muted-foreground font-medium">
                {t("pickupMapPage.loading")}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-300px">
            <div className="bg-card rounded-2xl shadow-lg border border-destructive/20 p-8 w-full max-w-md mx-auto text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-destructive mb-2">
                {t("pickupMapPage.error")}
              </h2>
              <p className="text-muted-foreground">{error}</p>
              <button
                type="button"
                onClick={fetchShops}
                className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
              >
                <ArrowPathIcon className="w-5 h-5" />
                {t("pickupMapPage.refresh")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-2xl shadow-lg border border-border px-4 py-4 md:px-8 md:py-6 mb-6">
              <h2 className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-4 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-primary" />
                {t("pickupMapPage.availableShops")}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                {t("pickupMapPage.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-4 md:gap-6">
              <div className="bg-card rounded-2xl shadow-lg border border-border px-4 py-4 md:px-8 md:py-6 flex flex-col">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-4 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-primary" />
                  {t("pickupMapPage.map")}
                </h2>

                <div className="bg-muted rounded-lg border border-border overflow-hidden flex-1 min-h-320px h-80 md:h-96">
                  <MapContainer
                    center={
                      selectedShop
                        ? [selectedShop.lat, selectedShop.lng]
                        : [mapCenter.lat, mapCenter.lng]
                    }
                    zoom={selectedShop ? 14 : mapZoom}
                    scrollWheelZoom={true}
                    style={{ width: "100%", height: "100%" }}
                    className="w-full h-full"
                    whenCreated={(map) => {
                      if (shops.length > 1) {
                        const bounds = L.latLngBounds(
                          shops.map((s) => [s.lat, s.lng])
                        );
                        map.fitBounds(bounds, { padding: [40, 40] });
                      }
                    }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {/* Pan/zoom to selected shop when changed */}
                    {selectedShop && (
                      <MapPanToShop shop={selectedShop} zoom={14} />
                    )}
                    {shops.map((shop) => (
                      <Marker
                        key={shop.id}
                        position={[shop.lat, shop.lng]}
                        eventHandlers={{
                          click: () => setSelectedShop(shop),
                        }}
                        icon={L.icon({
                          iconUrl:
                            "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png",
                          iconSize: [25, 41],
                          iconAnchor: [12, 41],
                          popupAnchor: [1, -34],
                          shadowUrl:
                            "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png",
                          shadowSize: [41, 41],
                        })}
                      >
                        {selectedShop && selectedShop.id === shop.id && (
                          <Popup
                            position={[shop.lat, shop.lng]}
                            eventHandlers={{
                              close: () => setSelectedShop(null),
                            }}
                          >
                            <div>
                              <h3 className="font-bold text-foreground text-base">
                                {shop.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {shop.address}
                              </p>
                              <div className="mt-2 flex items-center text-sm text-foreground">
                                <span className="text-lg">🕒</span>
                                <span className="ml-2">{shop.open_hours}</span>
                              </div>
                            </div>
                          </Popup>
                        )}
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>

              <div className="bg-card rounded-2xl shadow-lg border border-border px-4 py-4 md:px-6 md:py-6 flex flex-col">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-4 flex items-center gap-2">
                  <BuildingStorefrontIcon className="w-5 h-5 text-primary" />
                  {shops.length > 0
                    ? t("pickupMapPage.availableShops")
                    : t("pickupMapPage.noShops")}
                </h2>

                <div className="bg-muted rounded-lg p-3 md:p-4 flex-1 min-h-320px h-80 md:h-96 overflow-y-auto border border-border space-y-3 md:space-y-4">
                  {shops.map((shop) => (
                    <div
                      key={shop.id}
                      className={`bg-card p-3 md:p-4 rounded-lg shadow-sm border border-border cursor-pointer transition-all duration-300 hover:shadow-md ${
                        selectedShop?.id === shop.id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedShop(shop)}
                    >
                      <h3 className="font-bold text-foreground text-base md:text-lg">
                        {shop.name}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground mt-1">
                        {shop.address}
                      </p>
                      <div className="mt-2 flex items-center text-sm md:text-base text-foreground">
                        <span className="text-lg">🕒</span>
                        <span className="ml-2">{shop.open_hours}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PickupMapPage;
