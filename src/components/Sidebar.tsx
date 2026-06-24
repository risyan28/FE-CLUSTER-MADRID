import { useLocation, useNavigate } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EventIcon from '@mui/icons-material/Event';
import AssessmentIcon from '@mui/icons-material/Assessment';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PersonIcon from '@mui/icons-material/Person';

const adminMenu = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Kelola Iuran', icon: <ReceiptIcon />, path: '/iuran' },
  { text: 'Iuran IPKL', icon: <FactCheckIcon />, path: '/tagihan' },
  { text: 'Kas', icon: <AccountBalanceIcon />, path: '/kas' },
  { text: 'Kegiatan', icon: <EventIcon />, path: '/kegiatan' },
  { text: 'Data Warga', icon: <GroupIcon />, path: '/warga-hunian' },
  { text: 'QRIS', icon: <QrCodeIcon />, path: '/qris' },
  { text: 'Laporan', icon: <AssessmentIcon />, path: '/laporan' },
];

const wargaMenu = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Tagihan Saya', icon: <FactCheckIcon />, path: '/pembayaran/saya' },
  { text: 'Kegiatan', icon: <EventIcon />, path: '/kegiatan' },
];

export default function Sidebar({ role, open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const menu = role === 'admin' ? adminMenu : wargaMenu;

  const content = (
    <div>
      <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box component="img" src="/logo.jpeg" alt="Logo" sx={{ width: 40, height: 40, borderRadius: 1 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} color="primary.main">
            Cluster Madrid
          </Typography>
          <Typography variant="caption" color="text.secondary" lineHeight={1}>
            RT 003 RW 016
          </Typography>
        </Box>
      </Box>
      <List sx={{ flexGrow: 1 }}>
        {menu.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => { navigate(item.path); if (onClose) onClose(); }}
            sx={{ mx: 1, borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List>
        <ListItemButton
          selected={location.pathname === '/profil'}
          onClick={() => { navigate('/profil'); if (onClose) onClose(); }}
          sx={{ mx: 1, borderRadius: 2, mb: 0.5 }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}><PersonIcon /></ListItemIcon>
          <ListItemText primary="Profil" />
        </ListItemButton>
      </List>
    </div>
  );

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{ width: 240, flexShrink: 0, display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' } }}
        open
      >
        {content}
      </Drawer>
      <Drawer
        variant="temporary"
        sx={{ display: { xs: 'block', md: 'none' } }}
        open={open}
        onClose={onClose}
      >
        {content}
      </Drawer>
    </>
  );
}
