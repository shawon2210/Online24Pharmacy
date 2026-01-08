import { useAuth as useAuthContext } from "../contexts/AuthContextCore";

/**
 * Custom hook for authentication
 * Re-exports useAuth from AuthContext for consistency
 * 
 * @returns {Object} Auth context with user and methods
 */
export function useAuth() {
  return useAuthContext();
}
