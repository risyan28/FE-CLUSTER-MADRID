import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WargaHunian from './pages/WargaHunian';
import Iuran from './pages/Iuran';
import Tagihan from './pages/Tagihan';
import PembayaranSaya from './pages/PembayaranSaya';
import Kas from './pages/Kas';
import Kegiatan from './pages/Kegiatan';
import Laporan from './pages/Laporan';
import Profil from './pages/Profil';
import QrisAdmin from './pages/QrisAdmin';
import AdminLayout from './layouts/AdminLayout';
import WargaLayout from './layouts/WargaLayout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function RoleGuard({ role, children }: { role: string; children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== role) return <Navigate to="/dashboard" />;
  return <>{children}</>;
}

function AppLayout() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminLayout /> : <WargaLayout />;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* Single layout — renders admin or warga sidebar based on role */}
      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/kegiatan" element={<Kegiatan />} />
        <Route path="/profil" element={<Profil />} />

        {/* Admin-only pages */}
        <Route path="/warga-hunian" element={<RoleGuard role="admin"><WargaHunian /></RoleGuard>} />
        <Route path="/warga" element={<Navigate to="/warga-hunian" />} />
        <Route path="/hunian" element={<Navigate to="/warga-hunian" />} />
        <Route path="/iuran" element={<RoleGuard role="admin"><Iuran /></RoleGuard>} />
        <Route path="/tagihan" element={<RoleGuard role="admin"><Tagihan /></RoleGuard>} />
        <Route path="/pembayaran" element={<Navigate to="/tagihan" />} />
        <Route path="/kas" element={<RoleGuard role="admin"><Kas /></RoleGuard>} />
        <Route path="/laporan" element={<RoleGuard role="admin"><Laporan /></RoleGuard>} />
        <Route path="/qris" element={<RoleGuard role="admin"><QrisAdmin /></RoleGuard>} />

        <Route path="/pembayaran/saya" element={<PembayaranSaya />} />
      </Route>
    </Routes>
  );
}
