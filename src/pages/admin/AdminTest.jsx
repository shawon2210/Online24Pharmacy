import { useAuth } from '../../contexts/AuthContext';

export default function AdminTest() {
  const { user, isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-green-600 mb-6">✅ Admin Access Working!</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="font-semibold text-blue-900">Authentication Status:</p>
            <p className="text-blue-700">Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <p className="font-semibold text-green-900">Admin Status:</p>
            <p className="text-green-700">Is Admin: {isAdmin ? '✅ Yes' : '❌ No'}</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="font-semibold text-purple-900">User Info:</p>
            <pre className="text-sm text-purple-700 mt-2 overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="font-semibold text-yellow-900">LocalStorage:</p>
            <p className="text-sm text-yellow-700">
              auth_user: {localStorage.getItem('auth_user') ? '✅ Exists' : '❌ Missing'}
            </p>
            <p className="text-sm text-yellow-700">
              auth_token: {localStorage.getItem('auth_token') ? '✅ Exists' : '❌ Missing'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
