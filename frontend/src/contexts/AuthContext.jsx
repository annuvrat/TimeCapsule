import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Configure axios defaults
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
axios.defaults.baseURL = API_URL;

// Add request interceptor to handle errors
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    // Check if there's a stored token and validate it
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          setToken(storedToken);
          // Set user data from localStorage if available
          const userData = JSON.parse(localStorage.getItem('user'));
          if (userData) {
            setUser(userData);
            // Set the Authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          } else {
            throw new Error('No user data found');
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    validateToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/users/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      
      // Set the Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast.success('Successfully logged in!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Failed to login');
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('/api/users/register', {
        username,
        email,
        password,
      });
      
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      
      // Set the Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast.success('Successfully registered!');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.error || 'Failed to register');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    // Remove the Authorization header
    delete axios.defaults.headers.common['Authorization'];
    toast.info('Logged out successfully');
  };

  const value = {
    user,
    login,
    logout,
    register,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 