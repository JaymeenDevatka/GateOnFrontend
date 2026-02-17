import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Hook to handle protected navigation
 * Redirects to login if user is not authenticated
 */
export function useProtectedNavigation() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const navigateWithAuth = (path) => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: path } } });
    } else {
      navigate(path);
    }
  };

  return { navigateWithAuth };
}
