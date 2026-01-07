import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AdminAuditLog() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLog();
  }, []);

  const fetchAuditLog = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const { data } = await axios.get(`${API_URL}/api/admin/audit-log`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActions(data.actions || []);
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Audit Log</h1>
      <div className="bg-background rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase">Target</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase">Admin ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {actions.map((action) => (
              <tr key={action.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {action.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {action.targetType} - {action.targetId?.substring(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{action.adminId.substring(0, 8)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{action.ipAddress || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(action.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
