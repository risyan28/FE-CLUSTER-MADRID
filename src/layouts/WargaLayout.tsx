import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/pembayaran/saya': 'Tagihan Saya',
  '/kegiatan': 'Kegiatan',
  '/profil': 'Profil',
};

export default function WargaLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Cluster Madrid';

  useEffect(() => { document.title = `${title} | Cluster Madrid`; }, [title]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar title={title} onMenuClick={() => setMobileOpen(!mobileOpen)} />
      <Sidebar role="warga" open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, pb: { xs: '72px', md: 3 } }}>
        <Toolbar />
        <Outlet />
      </Box>
      <BottomNav role="warga" />
    </Box>
  );
}
