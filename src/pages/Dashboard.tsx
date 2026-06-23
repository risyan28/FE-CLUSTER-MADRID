import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend } from 'recharts';

function StatCard({ icon, label, value, bgcolor }) {
  return (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: `${bgcolor}12`, display: 'flex', color: bgcolor }}>
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>{label}</Typography>
          <Typography fontWeight={700} color="text.primary" sx={{ mt: 0.25, typography: { xs: 'body2', sm: 'h6' } }}>{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [grafikIuran, setGrafikIuran] = useState([]);
  const [grafikKas, setGrafikKas] = useState([]);
  const isAdmin = user?.role === 'admin';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const chartHeight = isMobile ? 220 : 300;

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/dashboard/grafik-iuran').then(r => setGrafikIuran(r.data)).catch(() => {});
    api.get('/dashboard/grafik-kas').then(r => setGrafikKas(r.data)).catch(() => {});
  }, [user]);

  if (!stats) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  const bulanNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5, mb: 4 }}>
        <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
          <StatCard icon={<AccountBalanceWalletIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />} label="Total Kas" value={`Rp ${Number(stats.saldo).toLocaleString()}`} bgcolor="#6366f1" />
        </Box>
        <StatCard icon={<ArrowCircleUpIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />} label="Pemasukan" value={`Rp ${Number(stats.pemasukanBulanIni).toLocaleString()}`} bgcolor="#059669" />
        <StatCard icon={<ArrowCircleDownIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />} label="Pengeluaran" value={`Rp ${Number(stats.pengeluaranBulanIni).toLocaleString()}`} bgcolor="#e11d48" />
      </Box>
      <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Grafik Pembayaran Iuran</Typography>
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <BarChart data={grafikIuran.map(d => ({ ...d, bulan: bulanNames[d.bulan - 1] }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bulan" />
                    <YAxis />
                    <ReTooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#1976d2" name="Total Tagihan" label={{ position: 'top', fontSize: 11 }} />
                    <Bar dataKey="belum_lunas" fill="#ed6c02" name="Belum Lunas" label={{ position: 'top', fontSize: 11 }} />
                    <Bar dataKey="lunas" fill="#388e3c" name="Lunas" label={{ position: 'top', fontSize: 11 }} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Grafik Kas</Typography>
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <LineChart data={grafikKas.map(d => ({ ...d, bulan: bulanNames[d.bulan - 1] }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bulan" />
                    <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                    <ReTooltip formatter={(v: number) => `Rp ${Number(v).toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="masuk" stroke="#388e3c" name="Pemasukan" strokeWidth={2}
                      label={({ x, y, value }) => value > 0 ? <text x={x} y={y - 8} fill="#388e3c" fontSize={11} textAnchor="middle">Rp {Number(value).toLocaleString()}</text> : null} />
                    <Line type="monotone" dataKey="keluar" stroke="#d32f2f" name="Pengeluaran" strokeWidth={2}
                      label={({ x, y, value }) => value > 0 ? <text x={x} y={y + 16} fill="#d32f2f" fontSize={11} textAnchor="middle">Rp {Number(value).toLocaleString()}</text> : null} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
    </Box>
  );
}
