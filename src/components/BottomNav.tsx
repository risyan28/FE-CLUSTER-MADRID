import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import QrCodeIcon from '@mui/icons-material/QrCode';

const adminItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Tagihan', icon: <FactCheckIcon />, path: '/pembayaran/saya' },
  { label: 'Menu', icon: <MenuIcon />, path: '__menu__', isMenu: true },
  { label: 'Kegiatan', icon: <EventIcon />, path: '/kegiatan' },
  { label: 'Profil', icon: <PersonIcon />, path: '/profil' },
];

const wargaItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Tagihan', icon: <ReceiptIcon />, path: '/pembayaran/saya' },
  { label: 'Menu', icon: <MenuIcon />, path: '__menu__', isMenu: true },
  { label: 'Kegiatan', icon: <EventIcon />, path: '/kegiatan' },
  { label: 'Profil', icon: <PersonIcon />, path: '/profil' },
];

const adminMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Tagihan Saya', icon: <FactCheckIcon />, path: '/pembayaran/saya' },
  { text: 'Data Warga', icon: <GroupIcon />, path: '/warga-hunian' },
  { text: 'Kelola Iuran', icon: <ReceiptIcon />, path: '/iuran' },
  { text: 'Iuran IPKL', icon: <FactCheckIcon />, path: '/tagihan' },
  { text: 'Kas', icon: <AccountBalanceIcon />, path: '/kas' },
  { text: 'Kegiatan', icon: <EventIcon />, path: '/kegiatan' },
  { text: 'QRIS', icon: <QrCodeIcon />, path: '/qris' },
  { text: 'Laporan', icon: <AssessmentIcon />, path: '/laporan' },
  { text: 'Profil', icon: <PersonIcon />, path: '/profil' },
];

const wargaMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Tagihan Saya', icon: <FactCheckIcon />, path: '/pembayaran/saya' },
  { text: 'Kegiatan', icon: <EventIcon />, path: '/kegiatan' },
  { text: 'Profil', icon: <PersonIcon />, path: '/profil' },
];

export default function BottomNav({ role }: { role: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = role === 'admin' ? adminItems : wargaItems;
  const menuItems = role === 'admin' ? adminMenuItems : wargaMenuItems;

  const activeIdx = items.findIndex(i => !i.isMenu && location.pathname === i.path);
  const value = activeIdx >= 0 ? activeIdx : false;

  return (
    <>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          display: { xs: 'block', md: 'none' },
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
        elevation={8}
      >
        <BottomNavigation
          value={value}
          onChange={(_, idx) => {
            if (items[idx].isMenu) setMenuOpen(true);
            else navigate(items[idx].path);
          }}
          showLabels
        >
          {items.map((item, idx) => (
            <BottomNavigationAction
              key={idx}
              label={item.label}
              icon={item.icon}
              sx={item.isMenu ? {
                position: 'relative',
                top: -8,
                '& .MuiSvgIcon-root': { fontSize: 32, color: 'primary.main' },
              } : {}}
            />
          ))}
        </BottomNavigation>
      </Paper>

      <SwipeableDrawer
        anchor="bottom"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpen={() => setMenuOpen(true)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '80vh',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
          <Box sx={{ width: 40, height: 4, bgcolor: 'grey.300', borderRadius: 2 }} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5, px: 1, pb: 2 }}>
          {menuItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Box
                key={item.path}
                onClick={() => { navigate(item.path); setMenuOpen(false); }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 1.5,
                  borderRadius: 2,
                  cursor: 'pointer',
                  bgcolor: active ? 'primary.main' : 'transparent',
                  color: active ? 'primary.contrastText' : 'text.secondary',
                  '&:hover': { bgcolor: active ? 'primary.dark' : 'action.hover' },
                }}
              >
                <Box sx={{ mb: 0.5, lineHeight: 0 }}>{item.icon}</Box>
                <Typography variant="caption" sx={{ textAlign: 'center', lineHeight: 1.2, fontWeight: active ? 600 : 400 }}>
                  {item.text}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </SwipeableDrawer>
    </>
  );
}
