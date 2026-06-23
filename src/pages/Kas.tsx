import { useState, useEffect } from 'react';
import api from '../services/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import DataTable from '../components/DataTable';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';

const defaultForm = { tipe: 'masuk', kategori: '', nominal: '', keterangan: '', tanggal: new Date().toISOString().split('T')[0] };

export default function Kas() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [data, setData] = useState([]);
  const [saldo, setSaldo] = useState({ saldo: 0, total_masuk: 0, total_keluar: 0 });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [filter, setFilter] = useState({ tipe: '' });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const load = async () => {
    try {
      const params: any = {};
      if (filter.tipe) params.tipe = filter.tipe;
      const [kasRes, saldoRes] = await Promise.all([api.get('/kas', { params }), api.get('/kas/saldo')]);
      setData(kasRes.data);
      setSaldo(saldoRes.data);
    } catch { setSnack({ open: true, message: 'Gagal memuat data', severity: 'error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const openAdd = () => { setForm(defaultForm); setOpen(true); };

  const handleSave = async () => {
    try {
      await api.post('/kas', { ...form, nominal: parseFloat(form.nominal) });
      setSnack({ open: true, message: 'Transaksi berhasil dicatat', severity: 'success' });
      setOpen(false); load();
    } catch { setSnack({ open: true, message: 'Gagal menyimpan', severity: 'error' }); }
  };

  const columns = [
    { key: 'tanggal', label: 'Tanggal' },
    { key: 'tipe', label: 'Tipe', render: (r: any) => <Chip label={r.tipe} color={r.tipe === 'masuk' ? 'success' : 'error'} size="small" /> },
    { key: 'kategori', label: 'Kategori' },
    { key: 'keterangan', label: 'Keterangan', render: (r: any) => {
      const p = r.pembayaran;
      if (!p) return r.keterangan;
      const t = p.tagihan;
      const metode = p.metode === 'transfer' ? 'Transfer Bank' : p.metode === 'qris' ? 'QRIS' : p.metode;
      const nama = t?.warga?.nama || '-';
      const bulan = t ? `${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][t.bulan - 1]} ${t.tahun}` : '-';
      return `Pembayaran IPKL via ${metode} - ${t?.iuran?.nama || ''} - ${nama} - ${bulan}`;
    }},
    { key: 'nominal', label: 'Nominal', render: (r: any) => (
      <Typography variant="body2" sx={{ color: r.tipe === 'masuk' ? 'success.main' : 'error.main', fontWeight: 600 }}>
        {r.tipe === 'masuk' ? '+' : '-'} Rp {Number(r.nominal).toLocaleString()}
      </Typography>
    )},
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#6366f112', display: 'flex', color: '#6366f1' }}>
                <AccountBalanceWalletIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>Saldo</Typography>
                <Typography fontWeight={700} color="text.primary" sx={{ mt: 0.25, typography: { xs: 'body2', sm: 'h6' } }}>Rp {Number(saldo.saldo || 0).toLocaleString()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#05966912', display: 'flex', color: '#059669' }}>
                <ArrowCircleUpIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>Masuk</Typography>
                <Typography fontWeight={700} color="text.primary" sx={{ mt: 0.25, typography: { xs: 'body2', sm: 'h6' } }}>Rp {Number(saldo.total_masuk || 0).toLocaleString()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#e11d4812', display: 'flex', color: '#e11d48' }}>
                <ArrowCircleDownIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>Keluar</Typography>
                <Typography fontWeight={700} color="text.primary" sx={{ mt: 0.25, typography: { xs: 'body2', sm: 'h6' } }}>Rp {Number(saldo.total_keluar || 0).toLocaleString()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Filter Tipe</InputLabel>
          <Select value={filter.tipe} label="Filter Tipe" onChange={(e) => setFilter({ ...filter, tipe: e.target.value })}>
            <MenuItem value="">Semua</MenuItem>
            <MenuItem value="masuk">Masuk</MenuItem>
            <MenuItem value="keluar">Keluar</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={openAdd}>Tambah Transaksi</Button>
      </Box>
      <DataTable columns={columns} data={data} searchPlaceholder="Cari transaksi..." searchKeys={['kategori', 'keterangan']} downloadFilename="kas.xlsx" />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>Tambah Transaksi Kas</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Tipe</InputLabel>
              <Select value={form.tipe} label="Tipe" onChange={(e) => setForm({ ...form, tipe: e.target.value })}>
                <MenuItem value="masuk">Kas Masuk</MenuItem>
                <MenuItem value="keluar">Kas Keluar</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Kategori" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} required />
            <TextField label="Nominal (Rp)" type="number" value={form.nominal} onChange={(e) => setForm({ ...form, nominal: e.target.value })} required />
            <TextField label="Keterangan" multiline rows={2} value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
            <TextField label="Tanggal" type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} InputLabelProps={{ shrink: true }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Batal</Button>
          <Button variant="contained" onClick={handleSave}>Simpan</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
