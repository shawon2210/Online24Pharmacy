import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
} from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import maplibregl from "maplibre-gl";
import axios from "axios";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import SEOHead from "../components/common/SEOHead";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const getDeliveryTime = (area) => {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();

  const zones = {
    dhanmondi: { cutoff: 16, deliveryHours: 2 },
    gulshan: { cutoff: 16, deliveryHours: 2 },
    banani: { cutoff: 16, deliveryHours: 2 },
    uttara: { cutoff: 15, deliveryHours: 4 },
    mirpur: { cutoff: 15, deliveryHours: 4 },
    mohammadpur: { cutoff: 16, deliveryHours: 3 },
    bashundhara: { cutoff: 15, deliveryHours: 4 },
    motijheel: { cutoff: 16, deliveryHours: 2 },
  };

  const zone = zones[area.toLowerCase()] || { cutoff: 15, deliveryHours: 4 };
  const cutoffTime = zone.cutoff * 60;
  const currentTime = hour * 60 + minutes;
  const timeLeft = cutoffTime - currentTime;

  if (timeLeft > 0) {
    const deliveryTime = new Date(
      now.getTime() + zone.deliveryHours * 60 * 60 * 1000
    );
    const hours = Math.floor(timeLeft / 60);
    const mins = timeLeft % 60;
    return {
      canDeliver: true,
      timeLeft: `${hours}h ${mins}m`,
      deliveryBy: deliveryTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      isToday: true,
    };
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  return {
    canDeliver: true,
    timeLeft: null,
    deliveryBy: tomorrow.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    isToday: false,
  };
};

export default function DeliveryMapPage() {
  const { t } = useTranslation();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [headerOffset, setHeaderOffset] = useState(0);
  const [searchArea, setSearchArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [deliveryTimer, setDeliveryTimer] = useState(null);

  useEffect(() => {
    if (selectedArea) {
      const timer = setInterval(() => {
        setDeliveryTimer(getDeliveryTime(selectedArea));
      }, 60000);
      setDeliveryTimer(getDeliveryTime(selectedArea));
      return () => clearInterval(timer);
    }
  }, [selectedArea]);

  // Compute header height dynamically so content sits flush below sticky header
  useLayoutEffect(() => {
    const el = document.querySelector("header");
    if (!el) return;
    const compute = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      setHeaderOffset(h);
    };
    compute();
    window.addEventListener("resize", compute, { passive: true });
    return () => window.removeEventListener("resize", compute);
  }, []);

  const navigateToLocation = useCallback((coordinates, _areaName) => {
    if (!map.current || !coordinates) return;

    try {
      map.current.easeTo({
        center: coordinates,
        zoom: 14,
        duration: 1500,
      });

      const marker = new maplibregl.Marker({ color: "#EF4444" })
        .setLngLat(coordinates)
        .addTo(map.current);

      setTimeout(() => marker.remove(), 5000);
    } catch (error) {
      console.error("Navigation failed:", error);
    }
  }, []);

  const handleCoverageCheck = useCallback(
    async (area) => {
      setLoading(true);
      toast.dismiss();
      try {
        const response = await axios.get(
          `${API_URL}/delivery/coverage?area=${area}`
        );
        const data = response.data;
        if (data.isCovered) {
          setSelectedArea(area);
          toast.success(
            () => (
              <div className="text-sm">
                <p className="font-bold">
                  {t("deliveryMapPage.greatNews")} {data.area}.
                </p>
                <p>
                  {t("deliveryMapPage.deliveryTime")}: {data.estimatedDelivery}{" "}
                  ({t("deliveryMapPage.deliveryFee")}: ৳{data.deliveryFee})
                </p>
              </div>
            ),
            { duration: 5000 }
          );
        } else {
          toast.error(
            () => (
              <div className="text-sm">
                <p className="font-bold">
                  {t("deliveryMapPage.sorry")} {data.area}{" "}
                  {t("deliveryMapPage.yet")}
                </p>
                <p>{t("deliveryMapPage.trySearching")}</p>
              </div>
            ),
            { duration: 5000 }
          );
        }
        if (data.coordinates) {
          navigateToLocation(data.coordinates, data.area);
        }
      } catch (error) {
        console.error("Coverage check failed:", error);
        toast.error(`${t("deliveryMapPage.couldNotGet")} ${area}.`);
      } finally {
        setLoading(false);
      }
    },
    [navigateToLocation, t]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCoverageCheck(searchArea);
  };

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const initializeMap = () => {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors",
            },
          },
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm",
            },
          ],
        },
        center: [90.4125, 23.8103],
        zoom: 11,
      });

      map.current.addControl(new maplibregl.NavigationControl(), "top-right");

      map.current.on("load", () => {
        fetchAndLoadZones();
        const params = new URLSearchParams(window.location.search);
        const areaParam = params.get("area");
        if (areaParam) {
          setSearchArea(areaParam);
          handleCoverageCheck(areaParam);
        }
      });
    };

    const timeoutId = setTimeout(initializeMap, 1);

    const fetchAndLoadZones = () => {
      fetch("/delivery-zones-dhaka.geojson")
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          localStorage.setItem("delivery-zones-cache", JSON.stringify(data));
          localStorage.setItem(
            "delivery-zones-cache-time",
            Date.now().toString()
          );
          loadDeliveryZones(data);
        })
        .catch((e) => {
          console.error("Failed to fetch or load delivery zones:", e);
        });
    };

    const loadDeliveryZones = (data) => {
      if (!map.current || map.current.getSource("delivery-zones")) return;

      try {
        map.current.addSource("delivery-zones", {
          type: "geojson",
          data: data,
        });

        map.current.addLayer({
          id: "delivery-fill",
          type: "fill",
          source: "delivery-zones",
          paint: {
            "fill-color": "#10B981",
            "fill-opacity": 0.3,
          },
        });

        map.current.addLayer({
          id: "delivery-outline",
          type: "line",
          source: "delivery-zones",
          paint: {
            "line-color": "#059669",
            "line-width": 2,
          },
        });

        data.features.forEach((feature) => {
          const coords = feature.geometry.coordinates[0];
          const center = coords
            .reduce(
              (acc, coord) => {
                acc[0] += coord[0];
                acc[1] += coord[1];
                return acc;
              },
              [0, 0]
            )
            .map((sum) => sum / coords.length);

          new maplibregl.Marker({ color: "#059669" })
            .setLngLat(center)
            .setPopup(
              new maplibregl.Popup({ offset: 25 }).setHTML(`
              <div class="p-3">
                <h3 class="font-bold text-lg mb-1">${feature.properties.name}</h3>
                <p class="text-sm text-gray-600">⏱️ ${feature.properties.deliveryTime}</p>
                <p class="text-sm text-green-600 font-semibold mt-1">✓ Free Delivery</p>
              </div>
            `)
            )
            .addTo(map.current);
        });
      } catch (error) {
        console.error("Error loading delivery zones:", error);
      }
    };

    return () => {
      clearTimeout(timeoutId);
      map.current?.remove();
    };
  }, [handleCoverageCheck, navigateToLocation]);

  return (
    <>
      <SEOHead title="Delivery Coverage Map - Online24 Pharma" />
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col overflow-hidden"
        style={{
          height: `100vh`,
          marginTop: `-${headerOffset}px`,
          paddingTop: `${headerOffset}px`,
        }}
      >
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 shadow-xl border-b-4 border-emerald-500 -mt-[1px]">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="bg-emerald-500 p-2 sm:p-3 rounded-xl shadow-lg flex-shrink-0">
                  <TruckIcon className="w-5 sm:w-7 h-5 sm:h-7 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-none truncate">
                    {t("deliveryMapPage.title")}
                  </h1>
                  <p className="text-emerald-200 text-xs sm:text-base font-medium mt-0.5 leading-none hidden sm:block truncate">
                    {t("deliveryMapPage.subtitle")}
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3 lg:gap-6 text-white flex-shrink-0">
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold text-emerald-400">
                    {t("deliveryMapPage.areasCount")}
                  </div>
                  <div className="text-xs text-slate-300">
                    {t("deliveryMapPage.areasLabel")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold text-emerald-400">
                    {t("deliveryMapPage.deliveryTime")}
                  </div>
                  <div className="text-xs text-slate-300">
                    {t("deliveryMapPage.deliveryLabel")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold text-emerald-400">
                    {t("deliveryMapPage.freeShipping")}
                  </div>
                  <div className="text-xs text-slate-300">
                    {t("deliveryMapPage.shippingLabel")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5 overflow-hidden">
          <div className="grid lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 h-full">
            <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-slate-100">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-4 sm:p-6 hover:shadow-2xl transition-all hover:border-emerald-400 duration-300">
                <h2 className="text-base sm:text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
                  <MagnifyingGlassIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="hidden sm:inline">
                    {t("deliveryMapPage.checkCoverage")}
                  </span>
                  <span className="sm:hidden">
                    {t("deliveryMapPage.checkCoverageShort")}
                  </span>
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                      {t("deliveryMapPage.enterAreaName")}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchArea}
                        onChange={(e) => setSearchArea(e.target.value)}
                        placeholder="e.g., Dhanmondi"
                        className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        required
                      />
                      <MapPinIcon className="w-5 h-5 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold hover:from-emerald-700 hover:to-emerald-600 disabled:from-slate-400 disabled:to-slate-400 transition-all shadow-lg hover:shadow-xl active:scale-95 duration-200"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t("deliveryMapPage.checking")}
                      </span>
                    ) : (
                      t("deliveryMapPage.checkCoverage")
                    )}
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
                <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-slate-800 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="hidden sm:inline">
                    {t("deliveryMapPage.quickAccess")}
                  </span>
                  <span className="sm:hidden">
                    {t("deliveryMapPage.quickAccessShort")}
                  </span>
                </h2>
                <div className="space-y-2">
                  {[
                    "Dhanmondi",
                    "Gulshan",
                    "Banani",
                    "Uttara",
                    "Mirpur",
                    "Mohammadpur",
                    "Bashundhara",
                    "Motijheel",
                  ].map((area) => (
                    <button
                      key={area}
                      onClick={() => handleCoverageCheck(area)}
                      disabled={loading}
                      className="w-full flex items-center justify-between p-2.5 sm:p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl hover:from-emerald-100 hover:to-green-100 transition-all cursor-pointer border border-emerald-200 hover:border-emerald-400 hover:shadow-md group disabled:opacity-50 disabled:cursor-not-allowed duration-200"
                    >
                      <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-emerald-700">
                        <MapPinIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{area}</span>
                      </span>
                      <span className="text-xs text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 ml-1">
                        ✓
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col gap-3 sm:gap-4 lg:gap-5 h-full">
              {deliveryTimer && selectedArea && (
                <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl p-3 sm:p-5 lg:p-6 shadow-xl text-white hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-12 sm:w-14 h-12 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                        <ClockIcon className="w-6 sm:w-8 h-6 sm:h-8" />
                      </div>
                      <div className="min-w-0">
                        {deliveryTimer.timeLeft ? (
                          <>
                            <p className="text-xs sm:text-sm font-semibold opacity-90">
                              Order in next {deliveryTimer.timeLeft}
                            </p>
                            <p className="text-base sm:text-lg lg:text-xl font-black leading-tight">
                              Get by {deliveryTimer.deliveryBy}{" "}
                              <span className="hidden sm:inline">
                                {deliveryTimer.isToday ? "today" : "tomorrow"}
                              </span>
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs sm:text-sm font-semibold opacity-90">
                              Order now
                            </p>
                            <p className="text-base sm:text-lg lg:text-xl font-black leading-tight">
                              Get by {deliveryTimer.deliveryBy} tomorrow
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <TruckIcon className="w-8 sm:w-10 h-8 sm:h-10 opacity-80 flex-shrink-0" />
                  </div>
                </div>
              )}
              <div className="flex-1 bg-white rounded-2xl shadow-2xl border-4 border-emerald-400 overflow-hidden relative min-h-[250px] sm:min-h-[300px]">
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 bg-white/95 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl shadow-lg border-2 border-emerald-500">
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    🗺️ <span className="hidden sm:inline">Interactive Map</span>
                  </p>
                  <p className="text-xs text-slate-600 hidden sm:block">
                    Click markers for details
                  </p>
                </div>
                <div ref={mapContainer} className="w-full h-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all hover:scale-105 duration-300 group cursor-pointer">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-all">
                      <ClockIcon className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-white">
                      Fast Delivery
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-100 font-medium">
                    2-6 hours in covered zones
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all hover:scale-105 duration-300 group cursor-pointer">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-all">
                      <TruckIcon className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-white">
                      Free Shipping
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                    No delivery charges
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all hover:scale-105 duration-300 group cursor-pointer">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-all">
                      <MapPinIcon className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-white">
                      Wide Coverage
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-purple-100 font-medium">
                    Serving 8+ major areas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
