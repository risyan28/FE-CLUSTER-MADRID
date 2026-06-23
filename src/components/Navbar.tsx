import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';

export default function Navbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, width: { md: 'calc(100% - 240px)' }, ml: { md: '240px' } }}>
      <Toolbar>
        <IconButton color="inherit" edge="start" onClick={onMenuClick} sx={{ mr: 2, display: 'none', minWidth: 44, minHeight: 44 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          {title || 'Cluster Madrid'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {user?.nama} ({user?.role})
          </Typography>
          <Button color="inherit" size="small" onClick={handleLogout} startIcon={<LogoutIcon />}
            sx={{ display: { xs: 'none', sm: 'flex' }, minWidth: 44, minHeight: 44 }}>
            Keluar
          </Button>
          <IconButton color="inherit" onClick={handleLogout} sx={{ display: { xs: 'flex', sm: 'none' }, minWidth: 44, minHeight: 44 }}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
