import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PropTypes from 'prop-types';

/**
 * A route guard for admin-only pages.
 *
 * - If the user is authenticated and has the 'ADMIN' role, it renders the requested page.
 * - If the user is not authenticated or not an admin, it redirects to the homepage.
 * - It handles the initial loading state of the authentication context.
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // You can replace this with a proper loading spinner component
    return <div>Loading...</div>;
  }

  if (isAuthenticated && isAdmin) {
    return children;
  }

  // Redirect them to the home page, but save the current location they were
  // trying to go to. This allows us to send them along to that page after they
  // log in, which is a nicer user experience than dropping them off on the
  // homepage.
  return <Navigate to="/" state={{ from: location }} replace />;
};

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminRoute;
