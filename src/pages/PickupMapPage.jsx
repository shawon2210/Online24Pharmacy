import React, { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import SEOHead from "../components/common/SEOHead";
import { useTranslation } from "react-i18next";

const PickupMapPage = () => {
  const { t } = useTranslation();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const markers = useRef({});

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("productId");

  useEffect(() => {
    const geocodeAddress = async (address) => {
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
    };

    const fetchShops = async () => {
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
          throw new Error("Failed to load pickup locations");
        }
        const data = await response.json();

        const normalized = await Promise.all(
          data.map(async (shop) => {
            let { lat, lng } = shop;
            lat = typeof lat === "string" ? parseFloat(lat) : lat;
            lng = typeof lng === "string" ? parseFloat(lng) : lng;

            if (isNaN(lat) || isNaN(lng)) {
              const geo = await geocodeAddress(shop.address || shop.name || "");
              if (geo) {
                lat = geo.lat;
                lng = geo.lng;
              }
            }

            if (typeof lat === "number" && typeof lng === "number") {
              if (Math.abs(lat) > 90 && Math.abs(lng) <= 90)
                [lat, lng] = [lng, lat];
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
    };

    fetchShops();
  }, [productId]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const apiKey = import.meta.env.VITE_MAPTILER_KEY || "";
    const styleUrl = apiKey
      ? `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`
      : "https://demotiles.maplibre.org/style.json";

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: styleUrl,
        center: [90.4125, 23.8103],
        zoom: 11,
        attributionControl: false,
      });

      map.current.addControl(new maplibregl.NavigationControl(), "top-right");
      map.current.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showAccuracyCircle: true,
        }),
        "top-left"
      );

      map.current.on("load", () => {
        setMapReady(true);
      });

      map.current.on("style.error", () => {
        setError(
          "Failed to load map style. Please check your internet connection."
        );
      });

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (_err) {
      setError("Failed to initialize map. Please refresh the page.");
    }
  }, []);

  useEffect(() => {
    if (!map.current || !mapReady) return;

    Object.values(markers.current).forEach((m) => m.remove());
    markers.current = {};

    shops.forEach((shop) => {
      const el = document.createElement("div");
      el.className = `shop-marker w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer flex items-center justify-center transition-all duration-300 ${
        selectedShop?.id === shop.id
          ? "bg-red-500 scale-125 ring-4 ring-red-200"
          : "bg-primary hover:opacity-90 hover:scale-110"
      }`;
      el.innerHTML = `<span class="text-white text-sm font-bold">🏥</span>`;

      const marker = new maplibregl.Marker(el)
        .setLngLat([shop.lng, shop.lat])
        .addTo(map.current);

      el.addEventListener("click", () => setSelectedShop(shop));

      markers.current[shop.id] = marker;
    });

    if (shops.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      shops.forEach((shop) => bounds.extend([shop.lng, shop.lat]));
      if (shops.length === 1) {
        map.current.setCenter([shops[0].lng, shops[0].lat]);
        map.current.setZoom(14);
      } else {
        map.current.fitBounds(bounds, { padding: 80, maxZoom: 16 });
      }
    }
  }, [shops, selectedShop, mapReady]);

  useEffect(() => {
    if (!map.current || !mapReady || !selectedShop) return;

    const existingPopups = document.querySelectorAll(".mapboxgl-popup");
    existingPopups.forEach((p) => p.remove());

    map.current.flyTo({
      center: [selectedShop.lng, selectedShop.lat],
      zoom: 15,
      essential: true,
    });

    const popup = new maplibregl.Popup({ closeButton: false, offset: 25 })
      .setLngLat([selectedShop.lng, selectedShop.lat])
      .setHTML(
        `<div class="p-2">
          <h3 class="font-bold text-foreground text-sm">${selectedShop.name}</h3>
          <p class="text-xs text-muted-foreground mt-1">${selectedShop.address}</p>
        </div>`
      )
      .addTo(map.current);

    const selectedMarker = markers.current[selectedShop.id];
    if (selectedMarker) {
      selectedMarker.setPopup(popup);
      popup.addTo(map.current);
    }

    return () => {
      popup.remove();
    };
  }, [selectedShop, mapReady]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground font-medium">
            {t("pickupMapPage.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-2xl shadow-lg border-2 border-red-200 p-8 max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">
            {t("pickupMapPage.error")}
          </h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={t("pickupMapPage.seoTitle")}
        description={t("pickupMapPage.seoDescription")}
        url="/pickup-map"
      />
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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-primary mb-1">
                {t("pickupMapPage.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("pickupMapPage.description")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 relative h-[600px] rounded-2xl overflow-hidden shadow-lg border-2 border-border hover:shadow-xl transition-shadow duration-300">
              <div ref={mapContainer} className="w-full h-full" />
            </div>
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold text-foreground mb-4">
                {shops.length > 0
                  ? t("pickupMapPage.availableShops")
                  : t("pickupMapPage.noShops")}
              </h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto bg-card rounded-2xl shadow-lg border-2 border-border p-4">
                {shops.map((shop) => (
                  <div
                    key={shop.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedShop?.id === shop.id
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                    }`}
                    onClick={() => setSelectedShop(shop)}
                  >
                    <h3 className="font-bold text-foreground text-base">
                      {shop.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {shop.address}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-foreground">
                      <span className="text-lg">🕒</span>
                      <span className="ml-2">{shop.hours}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PickupMapPage;
