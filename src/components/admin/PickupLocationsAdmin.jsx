import React, { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const PickupLocationsAdmin = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    lat: "",
    lng: "",
    open_hours: "",
    is_active: true,
  });
  // Geocode job state
  const [geocodeStatus, setGeocodeStatus] = useState(null);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");
  const [geocodeSuccess, setGeocodeSuccess] = useState("");
  // Fetch geocode job status
  const fetchGeocodeStatus = async () => {
    setGeocodeError("");
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const res = await fetch("/api/admin/pickup-locations/geocode-status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGeocodeStatus(data);
      } else {
        setGeocodeError("Failed to fetch geocode job status");
      }
    } catch (_e) {
      setGeocodeError("Failed to fetch geocode job status");
    }
  };

  // Start geocode job
  const handleStartGeocodeJob = async () => {
    setGeocodeLoading(true);
    setGeocodeError("");
    setGeocodeSuccess("");
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No admin token");
      const res = await fetch("/api/admin/pickup-locations/start-geocode-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setGeocodeSuccess("Geocode job started.");
        fetchGeocodeStatus();
      } else {
        const err = await res.text();
        setGeocodeError("Failed to start geocode job: " + err);
      }
    } catch (_e) {
      setGeocodeError("Failed to start geocode job");
    } finally {
      setGeocodeLoading(false);
    }
  };

  // Poll geocode status every 5s when job is running
  useEffect(() => {
    fetchGeocodeStatus();
    const interval = setInterval(() => {
      fetchGeocodeStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.error("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching locations...");
      const response = await fetch("/api/admin/pickup-locations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetch response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched locations:", data);
        setLocations(data);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch locations:", response.status, errorText);
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);

    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("You must be logged in as an admin to perform this action.");
      return;
    }

    try {
      const url = editingLocation
        ? `/api/admin/pickup-locations/${editingLocation.id}`
        : "/api/admin/pickup-locations";
      const method = editingLocation ? "PUT" : "POST";

      console.log("Making request to:", url, "with method:", method);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log("Success response:", result);
        fetchLocations();
        setShowForm(false);
        setEditingLocation(null);
        setFormData({
          name: "",
          address: "",
          lat: "",
          lng: "",
          open_hours: "",
          is_active: true,
        });
      } else {
        const errorText = await response.text();
        console.error("Error response:", response.status, errorText);
        alert(`Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Failed to save location:", error);
      alert(`Failed to save location: ${error.message}`);
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      lat: location.lat.toString(),
      lng: location.lng.toString(),
      open_hours: location.open_hours,
      is_active: location.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("You must be logged in as an admin to perform this action.");
      return;
    }

    try {
      console.log("Deleting location:", id);
      const response = await fetch(`/api/admin/pickup-locations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Delete response status:", response.status);

      if (response.ok) {
        console.log("Location deleted successfully");
        fetchLocations();
      } else {
        const errorText = await response.text();
        console.error("Failed to delete location:", response.status, errorText);
        alert(`Error deleting location: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Failed to delete location:", error);
      alert(`Failed to delete location: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Pickup Locations Management
          </h2>
          <div className="mt-2 flex flex-col gap-1">
            <div className="flex flex-row gap-2 items-center">
              <button
                onClick={handleStartGeocodeJob}
                disabled={geocodeLoading}
                className={`bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  geocodeLoading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {geocodeLoading ? "Starting..." : "Start Geocode Job"}
              </button>
              <button
                onClick={fetchGeocodeStatus}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded text-xs font-medium"
              >
                Refresh Status
              </button>
            </div>
            {geocodeError && (
              <div className="text-red-600 text-xs">{geocodeError}</div>
            )}
            {geocodeSuccess && (
              <div className="text-green-600 text-xs">{geocodeSuccess}</div>
            )}
            <div className="text-xs mt-1">
              <b>Geocode Job Status:</b>{" "}
              {geocodeStatus ? (
                <span>
                  {geocodeStatus.running ? (
                    <span className="text-blue-700 font-semibold">Running</span>
                  ) : (
                    <span className="text-gray-700">Idle</span>
                  )}
                  {geocodeStatus.lastRun && (
                    <span className="ml-2 text-gray-500">
                      Last: {geocodeStatus.lastRun.status} (
                      {geocodeStatus.lastRun.updatedAt
                        ? new Date(
                            geocodeStatus.lastRun.updatedAt
                          ).toLocaleString()
                        : ""}
                      )
                    </span>
                  )}
                  {typeof geocodeStatus.pending === "number" && (
                    <span className="ml-2 text-gray-500">
                      Pending: {geocodeStatus.pending}
                    </span>
                  )}
                  {typeof geocodeStatus.completed === "number" && (
                    <span className="ml-2 text-gray-500">
                      Completed: {geocodeStatus.completed}
                    </span>
                  )}
                  {geocodeStatus.error && (
                    <span className="ml-2 text-red-600">
                      Error: {geocodeStatus.error}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-gray-400">Loading...</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Location
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {editingLocation ? "Edit Location" : "Add New Location"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) =>
                      setFormData({ ...formData, lat: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) =>
                      setFormData({ ...formData, lng: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opening Hours
                </label>
                <input
                  type="text"
                  value={formData.open_hours}
                  onChange={(e) =>
                    setFormData({ ...formData, open_hours: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="9:00 AM – 9:00 PM"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="mr-2 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 pt-4">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {editingLocation ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingLocation(null);
                    setFormData({
                      name: "",
                      address: "",
                      lat: "",
                      lng: "",
                      open_hours: "",
                      is_active: true,
                    });
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coordinates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locations.map((location) => (
                <tr key={location.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {location.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {location.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {location.open_hours}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        location.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {location.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(location)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(location.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          <div className="divide-y divide-gray-200">
            {locations.map((location) => (
              <div key={location.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {location.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {location.address}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs leading-4 font-semibold rounded-full ${
                      location.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {location.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  <p>
                    <span className="font-medium">Coordinates:</span>{" "}
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                  <p>
                    <span className="font-medium">Hours:</span>{" "}
                    {location.open_hours}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(location)}
                    className="flex-1 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="flex-1 bg-red-50 text-red-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickupLocationsAdmin;
