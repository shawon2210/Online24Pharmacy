import React, { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const PickupMapPage = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const resizeObserverRef = useRef(null);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const popupRef = useRef(null);

  console.log("PickupMapPage component rendered");
  console.log("mapLoaded state:", mapLoaded);
  console.log("loading state:", loading);
  console.log("error state:", error);

  console.log("PickupMapPage component rendered");
  console.log("mapLoaded state:", mapLoaded);
  console.log("loading state:", loading);
  console.log("error state:", error);

  // Extract productId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("productId");

  // Fetch pickup locations for this product or all locations
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const url = productId
          ? `/api/pickup-locations?productId=${productId}`
          : "/api/pickup-locations";
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", response.status, errorText);
          throw new Error(
            `Failed to load pickup locations: ${response.status} ${errorText}`
          );
        }
        const contentType = response.headers.get("content-type");
        console.log("Response content-type:", contentType);

        // Be more lenient with content-type checking
        if (
          contentType &&
          !contentType.includes("application/json") &&
          !contentType.includes("text/plain")
        ) {
          console.warn("Unexpected content-type:", contentType);
        }

        const data = await response.json();
        console.log("Parsed data:", data);

        // Validate and correct coordinates
        const validatedShops = data
          .map((shop) => {
            let { lat, lng } = shop;

            // Convert to numbers if they are strings
            lat = typeof lat === "string" ? parseFloat(lat) : lat;
            lng = typeof lng === "string" ? parseFloat(lng) : lng;

            // Check if coordinates are valid
            if (
              typeof lat !== "number" ||
              typeof lng !== "number" ||
              isNaN(lat) ||
              isNaN(lng)
            ) {
              console.warn(
                `Invalid coordinate types for shop ${shop.name}: lat=${lat}, lng=${lng}`
              );
              return null;
            }

            // Check if coordinates are in valid ranges and potentially swapped
            if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
              // Likely swapped: lat is actually longitude, lng is actually latitude
              console.warn(
                `Coordinates likely swapped for shop ${shop.name}, correcting...`
              );
              [lat, lng] = [lng, lat];
            }

            // Validate final coordinates
            if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
              console.error(
                `Invalid coordinates for shop ${shop.name}: lat=${lat}, lng=${lng}`
              );
              return null;
            }

            return {
              ...shop,
              lat,
              lng,
            };
          })
          .filter((shop) => shop !== null);

        console.log("Validated shops:", validatedShops);
        setShops(validatedShops);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        // For debugging, set some test data with validated coordinates
        const testShops = [
          {
            id: "test-1",
            name: "Online24 Pharma - Dhanmondi",
            address: "House 12, Road 27, Dhanmondi, Dhaka",
            lat: 23.78, // Valid latitude (between -90 and 90)
            lng: 90.4, // Valid longitude (between -180 and 180)
            hours: "9:00 AM – 9:00 PM",
            inStock: true,
          },
          {
            id: "test-2",
            name: "Online24 Pharma - Gulshan",
            address: "Gulshan Avenue, Dhaka",
            lat: 23.7925, // Valid latitude
            lng: 90.4078, // Valid longitude
            hours: "8:00 AM – 10:00 PM",
            inStock: false,
          },
        ];
        console.log("Using validated test data:", testShops);
        setShops(testShops);
        setError(null); // Clear error since we have fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [productId]);

  // Initialize MapLibre map
  useEffect(() => {
    // Define handleWindowResize function outside setTimeout so it's available in cleanup
    const handleWindowResize = () => {
      if (map.current) {
        setTimeout(() => {
          if (map.current) {
            map.current.resize();
          }
        }, 100);
      }
    };

    // Add a delay to ensure the DOM is fully ready
    const initTimer = setTimeout(() => {
      if (map.current || !mapContainer.current || mapInitialized) {
        console.log(
          "Map already initialized or no container or already initializing:",
          !!map.current,
          !!mapContainer.current,
          mapInitialized
        );
        return; // Initialize map only once
      }

      setMapInitialized(true);

      console.log("Initializing map with container:", mapContainer.current);
      console.log(
        "Container dimensions:",
        mapContainer.current.offsetWidth,
        "x",
        mapContainer.current.offsetHeight
      );

      // Check container visibility and computed style
      const computedStyle = window.getComputedStyle(mapContainer.current);
      console.log("Container computed style:", {
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        width: computedStyle.width,
        height: computedStyle.height,
        position: computedStyle.position,
        opacity: computedStyle.opacity,
      });

      // Check if container is actually in the DOM
      if (!document.contains(mapContainer.current)) {
        console.log("Container is not in DOM yet, waiting...");
        setTimeout(() => {
          if (mapContainer.current && !map.current) {
            console.log("Retrying map initialization after DOM ready");
            // Force re-run of this effect
            setMapLoaded(false);
          }
        }, 200);
        return;
      }

      // Ensure container has dimensions before initializing
      if (
        mapContainer.current.offsetWidth === 0 ||
        mapContainer.current.offsetHeight === 0
      ) {
        console.log(
          "Container has no dimensions, but proceeding with initialization anyway..."
        );
        // Don't return, just log and continue - the map can handle resizing later
      }

      // Simple map initialization
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://demotiles.maplibre.org/style.json",
        center: [90.4125, 23.8103],
        zoom: 11,
      });

      map.current.on("load", () => {
        console.log("Map loaded successfully!");
        setMapLoaded(true);
      });

      map.current.on("error", (e) => {
        console.error("Map error:", e);
        setError("Failed to load map. Please check your internet connection.");
      });

      // Add resize observer to handle container size changes
      const resizeObserver = new ResizeObserver(() => {
        if (map.current) {
          map.current.resize();
        }
      });
      resizeObserverRef.current = resizeObserver;

      if (mapContainer.current) {
        resizeObserver.observe(mapContainer.current);
      }

      // Also listen to window resize events
      window.addEventListener("resize", handleWindowResize);
    }, 1000); // End of setTimeout

    return () => {
      clearTimeout(initTimer);
      if (resizeObserverRef.current && mapContainer.current) {
        resizeObserverRef.current.unobserve(mapContainer.current);
      }
      window.removeEventListener("resize", handleWindowResize);
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, []);

  // Add markers when shops load and map is ready
  useEffect(() => {
    if (!map.current || !shops.length || !mapLoaded) {
      console.log("Not adding markers yet:", {
        map: !!map.current,
        shopsCount: shops.length,
        mapLoaded,
      });
      return;
    }

    console.log("Adding markers for", shops.length, "shops");

    // Clear existing markers
    const existingMarkers = document.querySelectorAll(".shop-marker");
    existingMarkers.forEach((marker) => marker.remove());

    // Add new markers
    shops.forEach((shop, index) => {
      // Double-check coordinates before creating markers
      if (
        typeof shop.lat !== "number" ||
        typeof shop.lng !== "number" ||
        Math.abs(shop.lat) > 90 ||
        Math.abs(shop.lng) > 180
      ) {
        console.error(
          `Skipping invalid shop coordinates for ${shop.name}: lat=${shop.lat}, lng=${shop.lng}`
        );
        return;
      }

      console.log(
        `Creating marker ${index + 1} for ${shop.name} at [${shop.lng}, ${
          shop.lat
        }]`
      );

      const el = document.createElement("div");
      el.className = `shop-marker w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer flex items-center justify-center transition-all duration-300 ${
        selectedShop?.id === shop.id
          ? "bg-red-500 scale-125 ring-4 ring-red-200"
          : "bg-emerald-600 hover:bg-emerald-700 hover:scale-110"
      }`;
      el.innerHTML = `<span class="text-white text-sm font-bold">🏥</span>`;
      el.title = `${shop.name} - Click to select`; // Better tooltip

      el.addEventListener("click", () => {
        console.log(
          "Marker clicked for shop:",
          shop.name,
          "at coordinates:",
          shop.lng,
          shop.lat
        );
        setSelectedShop(shop);
        // The popup and fly animation will be handled by the selectedShop useEffect
      });

      // Create marker with proper positioning
      const marker = new maplibregl.Marker({
        element: el,
        anchor: "bottom", // Anchor marker to bottom so it points to the exact location
      })
        .setLngLat([shop.lng, shop.lat])
        .addTo(map.current);

      // Store marker reference for potential cleanup
      el._marker = marker;
    });

    console.log("Markers added successfully");

    // Fit map to all shops initially (only if no shop is selected)
    if (shops.length > 0 && !selectedShop) {
      // Filter out shops with invalid coordinates
      const validShops = shops.filter(
        (shop) =>
          typeof shop.lat === "number" &&
          typeof shop.lng === "number" &&
          Math.abs(shop.lat) <= 90 &&
          Math.abs(shop.lng) <= 180
      );

      if (validShops.length === 0) {
        console.error("No shops with valid coordinates found");
        return;
      }

      console.log("Fitting map to", validShops.length, "valid shops");

      if (validShops.length === 1) {
        map.current.flyTo({
          center: [validShops[0].lng, validShops[0].lat],
          zoom: 14,
        });
      } else {
        // LngLatBounds expects [lng, lat] arrays for both corners
        const bounds = validShops.reduce(
          (bounds, shop) => bounds.extend([shop.lng, shop.lat]),
          new maplibregl.LngLatBounds(
            [validShops[0].lng, validShops[0].lat],
            [validShops[0].lng, validShops[0].lat]
          )
        );
        map.current.fitBounds(bounds, { padding: 50, duration: 1000 });
      }
    }
  }, [shops, selectedShop, mapLoaded]);

  // Handle selected shop changes - ensure map shows the selected shop area
  useEffect(() => {
    console.log(
      "selectedShop useEffect triggered with:",
      selectedShop?.name || "null"
    );

    if (selectedShop && map.current) {
      console.log(
        "Processing selected shop:",
        selectedShop.name,
        "at coordinates:",
        selectedShop.lng,
        selectedShop.lat
      );

      // Remove existing popup
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }

      // Create new popup with better positioning
      if (
        typeof selectedShop.lat === "number" &&
        typeof selectedShop.lng === "number" &&
        Math.abs(selectedShop.lat) <= 90 &&
        Math.abs(selectedShop.lng) <= 180
      ) {
        console.log("Creating popup for selected shop");

        popupRef.current = new maplibregl.Popup({
          closeButton: true,
          closeOnClick: false,
          offset: [0, -10], // Offset popup slightly above the marker
          anchor: "bottom", // Anchor to bottom of marker
        })
          .setLngLat([selectedShop.lng, selectedShop.lat])
          .setHTML(
            `
            <div class="p-3 max-w-xs">
              <h3 class="font-bold text-gray-900 text-sm">${
                selectedShop.name
              }</h3>
              <p class="text-xs text-gray-600 mt-1">${selectedShop.address}</p>
              <div class="mt-2 flex items-center text-xs">
                <span class="text-gray-500">🕒</span>
                <span class="ml-1">${selectedShop.hours}</span>
              </div>
              <div class="mt-2 flex items-center">
                <span class="w-2 h-2 rounded-full mr-2 ${
                  selectedShop.inStock ? "bg-green-500" : "bg-red-500"
                }"></span>
                <span class="text-xs font-medium">${
                  selectedShop.inStock ? "In Stock" : "Out of Stock"
                }</span>
              </div>
            </div>
          `
          )
          .addTo(map.current);

        // Handle popup close
        popupRef.current.on("close", () => {
          console.log("Popup closed, clearing selected shop");
          setSelectedShop(null);
        });

        console.log("Flying to selected shop location");
        // Fly to the selected shop with optimal zoom for visibility
        map.current.flyTo({
          center: [selectedShop.lng, selectedShop.lat],
          zoom: 16, // Good balance between detail and overview
          duration: 1000, // Smooth animation
          essential: true, // This animation will not be interrupted by subsequent animations
        });
      } else {
        console.error(
          `Cannot create popup for shop ${selectedShop.name}: invalid coordinates lat=${selectedShop.lat}, lng=${selectedShop.lng}`
        );
      }
    } else {
      console.log("No selected shop or map not ready");
      // Remove popup when no shop is selected
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    }
  }, [selectedShop]);

  // Cleanup popup on unmount
  useEffect(() => {
    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading pickup locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold text-red-600 mb-2">Oops!</h2>
        <p className="text-gray-600">{error}</p>
        <p className="mt-2 text-sm text-gray-500">
          Please try again or contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {productId ? "Pickup Locations" : "All Pharmacy Locations"}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          {productId
            ? "Select a pharmacy to pick up your order. Stock updates in real time."
            : "Find all available pharmacy locations for pickup services."}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2 relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <div
              ref={mapContainer}
              className="w-full h-full bg-gray-100"
              style={{
                minHeight: "300px",
                position: "relative",
                overflow: "hidden",
                width: "100%",
                height: "100%",
                display: "block",
                visibility: "visible",
                zIndex: 1,
              }}
            />
            {/* Map Loading Overlay */}
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-10">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-2"></div>
                  <p className="text-gray-600">Loading map...</p>
                  <p className="text-xs text-gray-500 mt-1">
                    This may take a few seconds
                  </p>
                  <button
                    onClick={() => {
                      console.log("Manual map reload triggered");
                      setMapLoaded(false);
                      if (map.current) {
                        map.current.remove();
                        map.current = null;
                      }
                      // Force re-initialization
                      setTimeout(() => {
                        window.location.reload();
                      }, 500);
                    }}
                    className="mt-2 px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            {/* Shop Info Panel (Mobile Bottom Sheet / Desktop Sidebar) */}
            {selectedShop && (
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:w-80 lg:top-4 lg:bottom-auto lg:right-4 lg:rounded-xl lg:shadow-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">
                      {selectedShop.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedShop.address}
                    </p>
                    <div className="mt-2 flex items-center text-sm">
                      <span className="text-gray-500">🕒</span>
                      <span className="ml-1">{selectedShop.hours}</span>
                    </div>
                    <div className="mt-2 flex items-center">
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          selectedShop.inStock ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      <span className="text-sm font-medium">
                        {selectedShop.inStock
                          ? "✅ In Stock"
                          : "❌ Out of Stock"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedShop(null)}
                    className="lg:hidden text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(
                      "Mobile Select This Shop clicked for:",
                      selectedShop.name
                    );
                    // Add visual feedback by briefly highlighting the button
                    const button = e.target;
                    const originalText = button.textContent;
                    button.textContent = "Selecting...";
                    button.classList.add("bg-emerald-700");
                    // Shop is already selected, just ensure map shows it and then redirect
                    if (map.current && selectedShop) {
                      // Force immediate map update
                      map.current.flyTo({
                        center: [selectedShop.lng, selectedShop.lat],
                        zoom: 16,
                        duration: 800,
                      });
                    }
                    // Then redirect to cart after animation completes
                    setTimeout(() => {
                      window.location.href = `/cart?pickupShopId=${selectedShop.id}`;
                    }, 1000);
                  }}
                  className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm lg:text-base focus:ring-2 focus:ring-emerald-300 focus:outline-none"
                >
                  Select This Shop
                </button>
              </div>
            )}

            {/* Empty State */}
            {shops.length === 0 && !selectedShop && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                <div className="text-center p-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    No pickup locations found
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {productId
                      ? "This product is not available for pickup at any nearby pharmacy."
                      : "No pharmacy locations are currently available."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Shops List Section */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {productId ? "Available Shops" : "All Pharmacy Locations"}
            </h2>
            {shops.length === 0 ? (
              <p className="text-gray-600">
                {productId
                  ? "No shops available for this product."
                  : "No pharmacy locations available."}
              </p>
            ) : (
              <div className="space-y-3 lg:space-y-4 max-h-[400px] lg:max-h-[600px] overflow-y-auto">
                {shops.map((shop) => (
                  <div
                    key={shop.id}
                    className={`p-3 lg:p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                      selectedShop?.id === shop.id
                        ? "border-emerald-500 bg-emerald-50 shadow-lg ring-2 ring-emerald-200"
                        : "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md hover:bg-emerald-25"
                    }`}
                    onClick={() => {
                      console.log(
                        "Shop selected from list:",
                        shop.name,
                        "at coordinates:",
                        shop.lng,
                        shop.lat
                      );
                      setSelectedShop(shop);
                      // Map fly animation and popup will be handled by the selectedShop useEffect
                    }}
                  >
                    <h3 className="font-bold text-gray-900 text-sm lg:text-base">
                      {shop.name}
                    </h3>
                    <p className="text-xs lg:text-sm text-gray-600 mt-1 line-clamp-2">
                      {shop.address}
                    </p>
                    <div className="mt-2 flex items-center text-xs lg:text-sm">
                      <span className="text-gray-500">🕒</span>
                      <span className="ml-1">{shop.hours}</span>
                    </div>
                    <div className="mt-2 flex items-center">
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          shop.inStock ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      <span className="text-xs lg:text-sm font-medium">
                        {shop.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Select This Shop clicked for:", shop.name);
                        // First select the shop to show it on map instantly
                        setSelectedShop(shop);
                        // Add visual feedback by briefly highlighting the shop
                        const button = e.target;
                        const originalText = button.textContent;
                        button.textContent = "Selecting...";
                        button.classList.add("bg-emerald-700");
                        // Then redirect to cart after animation completes
                        setTimeout(() => {
                          window.location.href = `/cart?pickupShopId=${shop.id}`;
                        }, 1200); // Slightly longer than flyTo duration to ensure smooth UX
                      }}
                      className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 lg:px-4 rounded-lg transition-all duration-200 text-xs lg:text-sm focus:ring-2 focus:ring-emerald-300 focus:outline-none"
                    >
                      Select This Shop
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickupMapPage;
