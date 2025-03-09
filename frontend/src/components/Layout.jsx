import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      <AppBar position="static">
        <Toolbar sx={{ width: '100%' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Time Capsule
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1">
                Welcome, {user.username}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box 
        component="main" 
        sx={{ 
          flex: 1,
          width: '100%',
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
} 