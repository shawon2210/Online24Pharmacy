/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import SEOHead from "../../components/common/SEOHead";
import axios from "axios";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AdminPromotions() {
  const { t } = useTranslation();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", discount: "", active: true });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/promotions`);
      setPromotions(res.data.promotions || []);
    } catch (e) {
      console.warn("Promotions API missing; using mock data", e);
      setPromotions([
        { id: "p1", title: "New Year Sale", discount: "15%", active: true },
        { id: "p2", title: "Monsoon Offer", discount: "10%", active: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const headers = {};
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }
      await axios.post(`${API_URL}/admin/promotions`, form, { headers });
      fetchPromotions();
      setForm({ title: "", discount: "", active: true });
    } catch (e) {
      setPromotions((s) => [{ id: Date.now().toString(), ...form }, ...s]);
      setForm({ title: "", discount: "", active: true });
    }
  };

  return (
    <>
      <SEOHead title="Admin - Promotions" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="bg-background shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Promotions</h1>
            <p className="text-sm text-background0">
              Create and manage site promotions
            </p>
          </div>

          <form
            onSubmit={handleCreate}
            className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Promotion title"
              className="border px-3 py-2 rounded"
            />
            <input
              value={form.discount}
              onChange={(e) =>
                setForm((f) => ({ ...f, discount: e.target.value }))
              }
              placeholder="Discount (e.g. 15%)"
              className="border px-3 py-2 rounded"
            />
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, active: e.target.checked }))
                  }
                />
                <span className="text-sm">Active</span>
              </label>
              <button className="ml-auto btn-primary" type="submit">
                Create
              </button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-background">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-gray-200">
                {promotions.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {p.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {p.discount}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          p.active
                            ? "bg-green-100 text-green-800"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {p.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
