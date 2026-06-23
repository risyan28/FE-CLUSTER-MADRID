import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';

const defaultForm = { judul: '', tanggal: new Date().toISOString().split('T')[0], jam: '', lokasi: '', deskripsi: '' };

export default function Kegiatan() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const load = async () => {
    try {
      const res = await api.get('/kegiatan');
      setData(res.data);
    } catch (err) {
      setSnack({ open: true, message: 'Gagal memuat data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(defaultForm); setEditId(null); setOpen(true); };
  const openEdit = (item) => {
    setForm({ judul: item.judul, tanggal: item.tanggal, jam: item.jam || '', lokasi: item.lokasi || '', deskripsi: item.deskripsi || '' });
    setEditId(item.id);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await api.put(`/kegiatan/${editId}`, form);
        setSnack({ open: true, message: 'Kegiatan diperbarui', severity: 'success' });
      } else {
        await api.post('/kegiatan', form);
        setSnack({ open: true, message: 'Kegiatan baru ditambahkan', severity: 'success' });
      }
      setOpen(false);
      load();
    } catch (err) {
      setSnack({ open: true, message: 'Gagal menyimpan', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/kegiatan/${confirm.id}`);
      setSnack({ open: true, message: 'Kegiatan dihapus', severity: 'success' });
      load();
    } catch (err) {
      setSnack({ open: true, message: 'Gagal menghapus', severity: 'error' });
    }
    setConfirm({ open: false, id: null });
  };

  const handleHadir = async (id) => {
    await api.post(`/kegiatan/${id}/hadir`, {});
    setSnack({ open: true, message: 'Kehadiran dicatat', severity: 'success' });
    load();
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      {isAdmin && (
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Tambah Kegiatan</Button>
        </Box>
      )}
      {data.length === 0 ? <EmptyState message="Belum ada kegiatan" /> : (
      <Grid container spacing={2}>
        {data.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" fontWeight={600}>{item.judul}</Typography>
                  <Chip label={item.status} size="small" color={item.status === 'akan_datang' ? 'info' : item.status === 'selesai' ? 'success' : 'error'} />
                </Box>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {item.tanggal}{item.jam ? ` ${item.jam}` : ''} | {item.lokasi}
                </Typography>
                <Typography variant="body2" mt={1}>{item.deskripsi}</Typography>
                {item.kehadiran?.length > 0 && (
                  <Typography variant="caption" color="text.secondary" mt={1} display="block">
                    {item.kehadiran.length} warga hadir
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                {!isAdmin && item.status === 'akan_datang' && (
                  <Button size="small" startIcon={<CheckCircleIcon />} onClick={() => handleHadir(item.id)}>
                    Saya Hadir
                  </Button>
                )}
                {isAdmin && (
                  <>
                    <IconButton onClick={() => openEdit(item)}><EditIcon /></IconButton>
                    <IconButton onClick={() => setConfirm({ open: true, id: item.id })} color="error"><DeleteIcon /></IconButton>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      )}
      <ConfirmDialog open={confirm.open} title="Hapus Kegiatan" message="Yakin ingin menghapus kegiatan ini?" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Kegiatan' : 'Tambah Kegiatan'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Judul" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} required />
            <TextField label="Tanggal" type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} InputLabelProps={{ shrink: true }} required />
            <TextField label="Jam" type="time" value={form.jam} onChange={(e) => setForm({ ...form, jam: e.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField label="Lokasi" value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} />
            <TextField label="Deskripsi" multiline rows={3} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
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
