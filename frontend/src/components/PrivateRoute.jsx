import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // or a loading spinner
  }

  return user ? children : <Navigate to="/login" />;
} 