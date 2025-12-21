import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function SubcategoryForm({ onSuccess }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/categories`);
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error("fetchCategories error:", err);
      setCategories([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("auth_token");
      await axios.post(
        `${API_URL}/admin/subcategory`,
        { name, description, categoryId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setDescription("");
      setCategoryId("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create subcategory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h3 className="font-bold text-lg">Create Subcategory</h3>
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
      <div>
        <label className="block mb-1">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="select select-bordered w-full"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      {!!error && <div className="text-red-500">{error}</div>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Creating..." : "Create Subcategory"}
      </button>
    </form>
  );
}
