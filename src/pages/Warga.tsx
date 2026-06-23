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
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';

const defaultForm = { nama: '', no_hp: '', status: 'Dihuni', blok: '', nomor: '' };

export default function Warga() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const load = async () => {
    try {
      const res = await api.get('/warga');
      setData(res.data);
    } catch (err) {
      setSnack({ open: true, message: 'Gagal memuat data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(defaultForm); setEditId(null); setOpen(true); };
  const openEdit = (item: any) => {
    setForm({ nama: item.nama, no_hp: item.no_hp || '', status: item.status, blok: item.blok || '', nomor: item.nomor || '' });
    setEditId(item.id);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await api.put(`/warga/${editId}`, form);
        setSnack({ open: true, message: 'Data warga diperbarui', severity: 'success' });
      } else {
        await api.post('/warga', form);
        setSnack({ open: true, message: 'Warga baru ditambahkan', severity: 'success' });
      }
      setOpen(false);
      load();
    } catch (err: any) {
      setSnack({ open: true, message: err.response?.data?.message || 'Gagal menyimpan', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/warga/${confirm.id}`);
      setSnack({ open: true, message: 'Warga berhasil dihapus', severity: 'success' });
      load();
    } catch (err) {
      setSnack({ open: true, message: 'Gagal menghapus', severity: 'error' });
    }
    setConfirm({ open: false, id: null });
  };

  const handleToggleRole = async (id: number) => {
    try {
      await api.put(`/warga/${id}/role`);
      setSnack({ open: true, message: 'Role berhasil diubah', severity: 'success' });
      load();
    } catch (err: any) {
      setSnack({ open: true, message: err.response?.data?.message || 'Gagal mengubah role', severity: 'error' });
    }
  };

  const columns = [
    { key: 'nama', label: 'Nama' },
    { key: 'no_hp', label: 'No HP' },
    { key: 'status', label: 'Status', render: (row: any) => {
      const s = row.status;
      if (s === 'Dihuni' || s === 'Dihuni/Kontrak') return <Chip label={s} color="success" size="small" />;
      if (s === 'Belum dihuni') return <Chip label="Belum Dihuni" color="warning" size="small" />;
      return <Chip label={s || '-'} size="small" />;
    }},
    { key: 'blok', label: 'Blok', render: (row: any) => row.blok && row.nomor ? `${row.blok}-${row.nomor}` : '-' },
    { key: 'role', label: 'Role', render: (row: any) => (
      <Chip
        icon={row.role === 'admin' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
        label={row.role === 'admin' ? 'Admin' : 'Warga'}
        color={row.role === 'admin' ? 'primary' : 'default'}
        size="small"
        onClick={() => handleToggleRole(row.id)}
        sx={{ cursor: 'pointer' }}
      />
    )},
    { key: 'aksi', label: 'Aksi', render: (row: any) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <IconButton onClick={() => openEdit(row)} size="small"><EditIcon /></IconButton>
        <IconButton onClick={() => setConfirm({ open: true, id: row.id })} color="error" size="small"><DeleteIcon /></IconButton>
      </Box>
    )},
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Tambah Warga</Button>
      </Box>
      <DataTable columns={columns} data={data} downloadFilename="warga.xlsx" searchPlaceholder="Cari nama atau blok..." searchFn={(row, q) => {
        const nama = (row.nama || '').toLowerCase();
        const blok = (row.blok || '').toLowerCase();
        const nomor = (row.nomor || '').toLowerCase();
        const nohp = (row.no_hp || '').toLowerCase();
        const blokNomor = `${blok}-${nomor}`;
        return nama.includes(q) || blok.includes(q) || nomor.includes(q) || nohp.includes(q) || blokNomor.includes(q);
      }} />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Warga' : 'Tambah Warga'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
            <TextField label="No HP" value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={form.status} label="Status" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <MenuItem value="Dihuni">Dihuni</MenuItem>
                <MenuItem value="Belum dihuni">Belum dihuni</MenuItem>
                <MenuItem value="Dihuni/Kontrak">Dihuni/Kontrak</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Blok" value={form.blok} onChange={(e) => setForm({ ...form, blok: e.target.value })} placeholder="Contoh: Q15" />
            <TextField label="Nomor" value={form.nomor} onChange={(e) => setForm({ ...form, nomor: e.target.value })} placeholder="Contoh: 52" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Batal</Button>
          <Button variant="contained" onClick={handleSave}>Simpan</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog open={confirm.open} title="Hapus Warga" message="Yakin ingin menghapus warga ini? Data tidak dapat dikembalikan." confirmLabel="Hapus" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
