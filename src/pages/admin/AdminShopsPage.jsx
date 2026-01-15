import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const AdminShopsPage = () => {
  const [shops, setShops] = useState([]);
  const [form, setForm] = useState({
    name: "",
    address: "",
    open_hours: "",
    lat: "",
    lng: "",
  });
  const [mapPos, setMapPos] = useState({ lat: 23.8103, lng: 90.4125 }); // Default: Dhaka
  const markerRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch shops for admin view (optional, for edit/list)
  React.useEffect(() => {
    const token = localStorage.getItem("auth_token");
    fetch("/api/admin/shops", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch shops");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setShops(data);
        else setShops([]);
      })
      .catch(() => setShops([]));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "lat" || e.target.name === "lng") {
      const lat = e.target.name === "lat" ? e.target.value : form.lat;
      const lng = e.target.name === "lng" ? e.target.value : form.lng;
      if (!isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
        setMapPos({ lat: parseFloat(lat), lng: parseFloat(lng) });
      }
    }
  };

  // Map click handler to set lat/lng
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setForm((prev) => ({
          ...prev,
          lat: e.latlng.lat.toFixed(6),
          lng: e.latlng.lng.toFixed(6),
        }));
        setMapPos({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return form.lat && form.lng ? (
      <Marker
        position={[parseFloat(form.lat), parseFloat(form.lng)]}
        ref={markerRef}
        icon={L.icon({
          iconUrl:
            "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })}
      />
    ) : null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    // Validate lat/lng
    if (
      !form.lat ||
      !form.lng ||
      isNaN(parseFloat(form.lat)) ||
      isNaN(parseFloat(form.lng))
    ) {
      setError(
        "Latitude and Longitude are required and must be valid numbers. You can pick on the map."
      );
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("auth_token");
      const resp = await fetch("/api/admin/shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(errText || "Failed to upload shop");
      }
      setSuccess("Shop uploaded successfully");
      setForm({ name: "", address: "", open_hours: "", lat: "", lng: "" });
      setMapPos({ lat: 23.8103, lng: 90.4125 });
      // Optionally refresh list
      const updated = await fetch("/api/admin/shops", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then((r) => r.json());
      setShops(Array.isArray(updated) ? updated : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Upload Pickup Shop</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-card p-6 rounded-xl shadow border border-border"
        autoComplete="off"
      >
        <div>
          <label className="block font-medium mb-1">Shop Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Open Hours</label>
          <input
            name="open_hours"
            value={form.open_hours}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Latitude</label>
              <input
                name="lat"
                value={form.lat}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
                type="number"
                step="any"
              />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Longitude</label>
              <input
                name="lng"
                value={form.lng}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
                type="number"
                step="any"
              />
            </div>
          </div>
          <div className="h-64 w-full mt-2 rounded overflow-hidden border border-border">
            <MapContainer
              center={[mapPos.lat, mapPos.lng]}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <LocationMarker />
            </MapContainer>
            <div className="text-xs text-muted-foreground mt-1">
              Click on the map to set shop location.
            </div>
          </div>
        </div>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Shop"}
        </button>
      </form>
      <div className="mt-10">
        <h2 className="text-lg font-bold mb-2">Current Shops</h2>
        <div className="space-y-2">
          {Array.isArray(shops) && shops.length > 0 ? (
            shops.map((shop) => (
              <div
                key={shop.id}
                className="bg-muted p-3 rounded border border-border"
              >
                <div className="font-semibold">{shop.name}</div>
                <div className="text-sm text-muted-foreground">
                  {shop.address}
                </div>
                <div className="text-xs">{shop.open_hours}</div>
                <div className="text-xs">
                  Lat: {shop.lat} | Lng: {shop.lng}
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground text-sm">No shops found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminShopsPage;
