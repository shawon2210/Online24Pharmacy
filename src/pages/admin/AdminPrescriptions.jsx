import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Please login as admin');
        return;
      }
      const { data } = await axios.get(`${API_URL}/api/admin/prescriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched prescriptions:', data.prescriptions);
      setPrescriptions(data.prescriptions || []);
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Session expired. Please login again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, adminNotes) => {
    if (!id || typeof id !== 'string') throw new Error('Invalid prescription ID');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Please login as admin');
        return;
      }
      await axios.put(`${API_URL}/api/admin/prescriptions/${encodeURIComponent(id)}/review`, 
        { status, adminNotes },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert(`Prescription ${status.toLowerCase()} successfully`);
      fetchPrescriptions();
    } catch (error) {
      console.error('Failed to update prescription:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Session expired. Please login again.');
      } else {
        alert('Failed to update prescription status');
      }
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Prescriptions</h1>
      <div className="bg-background rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {prescriptions.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-background0">No prescriptions found</td>
              </tr>
            ) : (
              prescriptions.map((rx) => (
                <tr key={rx.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{rx.referenceNumber}</div>
                    {rx.user && <div className="text-xs text-background0">{rx.user.email}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{rx.patientName || (rx.user ? `${rx.user.firstName} ${rx.user.lastName}` : 'N/A')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      rx.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      rx.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {rx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(rx.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    {rx.status !== 'APPROVED' && (
                      <button onClick={() => updateStatus(rx.id, 'APPROVED', 'Verified')} className="text-green-600 hover:text-green-900 font-medium">Approve</button>
                    )}
                    {rx.status !== 'REJECTED' && (
                      <button onClick={() => updateStatus(rx.id, 'REJECTED', 'Invalid')} className="text-red-600 hover:text-red-900 font-medium">Reject</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
