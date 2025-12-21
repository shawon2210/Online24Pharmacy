import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function CategoryForm({ onSuccess }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("auth_token");
      await axios.post(
        `${API_URL}/admin/category`,
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setDescription("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h3 className="font-bold text-lg">Create Category</h3>
      <div>
        <label className="block mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input input-bordered w-full"
        />
      </div>
      <div>
        <label className="block mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea textarea-bordered w-full"
        />
      </div>
      {!!error && <div className="text-red-500">{error}</div>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Creating..." : "Create Category"}
      </button>
    </form>
  );
}
