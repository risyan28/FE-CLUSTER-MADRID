import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import EmptyState from '../components/EmptyState';
import Grid from '@mui/material/Grid';

export default function Pembayaran() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [tagihanList, setTagihanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tagihan_id: '', metode: 'tunai', nominal: '', keterangan: '' });
  const [filter, setFilter] = useState({ status: '' });
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({ open: false, message: '', severity: 'success' });

  const load = async () => {
    try {
      const params: { status?: string } = {};
      if (filter.status) params.status = filter.status;
      const [bayarRes, tagihanRes] = await Promise.all([
        api.get('/pembayaran', { params }),
        api.get('/tagihan', { params: { status: 'belum_lunas' } })
      ]);
      setData(bayarRes.data);
      setTagihanList(tagihanRes.data);
    } catch (err) {
      setSnack({ open: true, message: 'Gagal memuat data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const openAdd = () => {
    setForm({ tagihan_id: '', metode: 'tunai', nominal: '', keterangan: '' });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      await api.post('/pembayaran', {
        tagihan_id: form.tagihan_id,
        metode: form.metode,
        nominal: parseFloat(form.nominal) || undefined,
        keterangan: form.keterangan
      });
      setSnack({ open: true, message: 'Pembayaran berhasil dicatat', severity: 'success' });
      setOpen(false);
      load();
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || 'Gagal menyimpan', severity: 'error' });
    }
  };

  const handleVerifikasi = async (id) => {
    try {
      await api.put(`/pembayaran/${id}/verifikasi`);
      setSnack({ open: true, message: 'Pembayaran diverifikasi', severity: 'success' });
      load();
    } catch (err: any) {
      setSnack({ open: true, message: err.response?.data?.message || 'Gagal verifikasi', severity: 'error' });
    }
  };

  const handleTolak = async (id) => {
    const alasan = window.prompt('Alasan penolakan:');
    if (!alasan) return;
    try {
      await api.put(`/pembayaran/${id}/tolak`, { alasan });
      setSnack({ open: true, message: 'Pembayaran ditolak', severity: 'info' });
      load();
    } catch (err: any) {
      setSnack({ open: true, message: err.response?.data?.message || 'Gagal menolak', severity: 'error' });
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Catat Pembayaran</Button>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter Status</InputLabel>
          <Select value={filter.status} label="Filter Status" onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
            <MenuItem value="">Semua</MenuItem>
            <MenuItem value="menunggu">Menunggu</MenuItem>
            <MenuItem value="lunas">Lunas</MenuItem>
            <MenuItem value="ditolak">Ditolak</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Warga</TableCell>
              <TableCell>Iuran</TableCell>
              <TableCell>Metode</TableCell>
              <TableCell>Nominal</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Tanggal</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow><TableCell colSpan={7}><EmptyState /></TableCell></TableRow>
            ) : data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.tagihan?.warga?.nama}</TableCell>
                <TableCell>{item.tagihan?.iuran?.nama}</TableCell>
                <TableCell>{item.metode}</TableCell>
                <TableCell>Rp {Number(item.nominal).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip label={item.status} color={item.status === 'lunas' ? 'success' : item.status === 'menunggu' ? 'warning' : 'error'} size="small" />
                </TableCell>
                <TableCell>{item.tgl_bayar}</TableCell>
                <TableCell>
                  {item.status === 'menunggu' && (
                    <>
                      <IconButton onClick={() => handleVerifikasi(item.id)} color="success" disabled={item.uploaded_by === user?.id}><CheckCircleIcon /></IconButton>
                      <IconButton onClick={() => handleTolak(item.id)} color="error" disabled={item.uploaded_by === user?.id}><CancelIcon /></IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Catat Pembayaran</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              options={tagihanList}
              getOptionLabel={(o) => `${o.warga?.nama} - ${o.iuran?.nama} (${o.bulan}/${o.tahun}) - Rp ${Number(o.nominal).toLocaleString()}`}
              onChange={(_, v) => setForm({ ...form, tagihan_id: v?.id || '', nominal: v?.nominal || '' })}
              renderInput={(params) => <TextField {...params} label="Cari Tagihan" />}
            />
            <FormControl fullWidth>
              <InputLabel>Metode</InputLabel>
              <Select value={form.metode} label="Metode" onChange={(e) => setForm({ ...form, metode: e.target.value })}>
                <MenuItem value="tunai">Tunai</MenuItem>
                <MenuItem value="transfer">Transfer Bank</MenuItem>
                <MenuItem value="qris">QRIS</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Nominal (Rp)" type="number" value={form.nominal} onChange={(e) => setForm({ ...form, nominal: e.target.value })} />
            <TextField label="Keterangan" multiline rows={2} value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
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
