import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import { Box } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: '100% !important',
          width: '100%',
          height: '100%',
          padding: '0 !important'
        }
      }
    },
    MuiBox: {
      styleOverrides: {
        root: {
          maxWidth: '100%'
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
        width: '100vw',
        maxWidth: '100%',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <AuthProvider>
          <Router>
            <ToastContainer position="top-right" />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<Layout />}>
                <Route path="/" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </Box>
    </ThemeProvider>
  );
}

export default App;
