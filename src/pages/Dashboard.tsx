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

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
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
  const [matriks, setMatriks] = useState(null);
  const [search, setSearch] = useState('');
  const [tahunMatriks, setTahunMatriks] = useState(new Date().getFullYear());
  const isAdmin = user?.role === 'admin';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const chartHeight = isMobile ? 220 : 300;

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/dashboard/grafik-iuran').then(r => setGrafikIuran(r.data)).catch(() => {});
    api.get('/dashboard/grafik-kas').then(r => setGrafikKas(r.data)).catch(() => {});
    api.get('/dashboard/matriks-iuran', { params: { tahun: tahunMatriks } }).then(r => setMatriks(r.data)).catch(() => {});
  }, [user, tahunMatriks]);

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
      {matriks && (() => {
        const m: any = matriks;
        const q = search.toLowerCase();
        const filtered = m.warga.filter((w: any) =>
          w.nama.toLowerCase().includes(q) ||
          (w.blok || '').toLowerCase().includes(q) ||
          (w.nomor || '').includes(q)
        );
        const statusLabel: Record<string, string> = { lunas: 'Lunas', nunggak: 'Nunggak', belum_lunas: 'Belum bayar' };
        const statusBg: Record<string, string> = { lunas: '#4caf50', nunggak: '#e53935', belum_lunas: '#bdbdbd' };
        const years = Array.from({ length: 5 }, (_, i) => tahunMatriks - 2 + i);
        return (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Typography variant="h6" fontWeight={600}>
              Matriks Pembayaran Iuran {m.tahun}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Cari nama atau blok..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ minWidth: 180 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                  sx: { fontSize: '0.8rem' }
                }}
              />
              <TextField
                select
                size="small"
                value={tahunMatriks}
                onChange={e => setTahunMatriks(Number(e.target.value))}
                sx={{ width: 90 }}
                inputProps={{ sx: { fontSize: '0.8rem', py: 0.5 } }}
              >
                {years.map(y => (
                  <MenuItem key={y} value={y} sx={{ fontSize: '0.8rem' }}>{y}</MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
          <Box sx={{ overflowX: 'auto' }}>
            <TableContainer component={Paper} sx={{ width: '100%' }}>
              <Table size="small" sx={{ tableLayout: 'fixed', '& .MuiTableCell-root': { px: '2px !important', py: '2px !important', border: '1px solid', borderColor: 'divider', fontSize: '0.65rem', lineHeight: 1.1 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 2, width: 120, textAlign: 'left' }}>Warga</TableCell>
                    <TableCell sx={{ fontWeight: 600, position: 'sticky', left: 120, bgcolor: 'background.paper', zIndex: 2, width: 44, textAlign: 'center' }}>Blok</TableCell>
                    {m.bulanList.map(({ bulan, label }: any) => (
                      <TableCell key={bulan} align="center" sx={{ fontWeight: 600, fontSize: '0.6rem', p: '2px !important', width: 22, minWidth: 22, maxWidth: 22 }}>{label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((w: any) => (
                    <TableRow key={w.id}>
                      <TableCell sx={{ fontWeight: 500, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1, fontSize: '0.65rem', whiteSpace: 'nowrap', px: '4px !important', width: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Tooltip title={w.nama}><span>{w.nama}</span></Tooltip>
                      </TableCell>
                      <TableCell sx={{ position: 'sticky', left: 120, bgcolor: 'background.paper', zIndex: 1, fontSize: '0.6rem', textAlign: 'center', px: '4px !important', width: 44, color: 'text.secondary' }}>
                        {w.blok && w.nomor ? `${w.blok}-${w.nomor}` : w.blok || w.nomor || '-'}
                      </TableCell>
                      {m.bulanList.map(({ bulan }: any) => {
                        const status = m.lookup[`${w.id}_${bulan}_${m.tahun}`];
                        return (
                          <TableCell key={bulan} align="center" sx={{ p: '2px !important', width: 22, minWidth: 22, maxWidth: 22 }}>
                            <div title={status ? statusLabel[status] : 'Tidak ada'} style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: status ? statusBg[status] : '#eee', display: 'inline-block', border: status ? '1px solid rgba(0,0,0,0.12)' : 'none' }} />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#4caf50', border: '1px solid rgba(0,0,0,0.12)', display: 'inline-block' }} />
              <Typography variant="caption" color="text.secondary">Lunas</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#bdbdbd', border: '1px solid rgba(0,0,0,0.12)', display: 'inline-block' }} />
              <Typography variant="caption" color="text.secondary">Belum Bayar</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#e53935', border: '1px solid rgba(0,0,0,0.12)', display: 'inline-block' }} />
              <Typography variant="caption" color="text.secondary">Nunggak</Typography>
            </Box>
          </Box>
        </Box>
        );
      })()}
    </Box>
  );
}
