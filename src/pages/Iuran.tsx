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
import ConfirmDialog from '../components/ConfirmDialog';
import Grid from '@mui/material/Grid';
import DataTable from '../components/DataTable';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const defaultForm = { nama: '', nominal_dihuni: '', nominal_belum_dihuni: '', periode: 'bulanan', keterangan: '' };

export default function Iuran() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [genLoading, setGenLoading] = useState(false);
  const [genBulan, setGenBulan] = useState(new Date().getMonth() + 1);
  const [genTahun, setGenTahun] = useState(new Date().getFullYear());

  const load = async () => {
    try { const res = await api.get('/iuran'); setData(res.data); }
    catch { setSnack({ open: true, message: 'Gagal memuat data', severity: 'error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(defaultForm); setEditId(null); setOpen(true); };
  const openEdit = (item: any) => {
    setForm({ nama: item.nama, nominal_dihuni: item.nominal_dihuni || '', nominal_belum_dihuni: item.nominal_belum_dihuni || '', periode: item.periode, keterangan: item.keterangan || '' });
    setEditId(item.id); setOpen(true);
  };

  const handleSave = async () => {
    try {
      const body = { nama: form.nama, nominal: 0, nominal_dihuni: parseFloat(form.nominal_dihuni), nominal_belum_dihuni: parseFloat(form.nominal_belum_dihuni), periode: form.periode, keterangan: form.keterangan };
      if (editId) { await api.put(`/iuran/${editId}`, body); setSnack({ open: true, message: 'Iuran diperbarui', severity: 'success' }); }
      else { await api.post('/iuran', body); setSnack({ open: true, message: 'Iuran baru ditambahkan', severity: 'success' }); }
      setOpen(false); load();
    } catch (err: any) { setSnack({ open: true, message: err.response?.data?.message || 'Gagal menyimpan', severity: 'error' }); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/iuran/${confirm.id}`);       setSnack({ open: true, message: 'Iuran berhasil dihapus', severity: 'success' }); load(); }
    catch { setSnack({ open: true, message: 'Gagal menghapus', severity: 'error' }); }
    setConfirm({ open: false, id: null });
  };

  const handleGenerate = async () => {
    setGenLoading(true);
    try {
      let total = 0;
      for (const i of data) {
        const res = await api.post(`/iuran/${i.id}/generate-tagihan`, { bulan: genBulan, tahun: genTahun });
        total += res.data.total || 0;
      }
      setSnack({ open: true, message: `Selesai! ${total} tagihan baru untuk ${genBulan}/${genTahun}`, severity: 'success' });
    } catch (err: any) {
      setSnack({ open: true, message: err.response?.data?.message || 'Gagal generate', severity: 'error' });
    }
    setGenLoading(false);
  };

  const columns = [
    { key: 'nama', label: 'Nama' },
    { key: 'nominal_dihuni', label: 'Dihuni / Kontrak', render: (r: any) => `Rp ${Number(r.nominal_dihuni).toLocaleString()}` },
    { key: 'nominal_belum_dihuni', label: 'Belum Dihuni', render: (r: any) => `Rp ${Number(r.nominal_belum_dihuni).toLocaleString()}` },
    { key: 'periode', label: 'Periode' },
    { key: 'status', label: 'Status', render: (r: any) => <Chip label={r.aktif ? 'Aktif' : 'Nonaktif'} color={r.aktif ? 'success' : 'default'} size="small" /> },
    { key: 'aksi', label: 'Aksi', render: (r: any) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Button size="small" variant="outlined" onClick={() => openEdit(r)}>Edit</Button>
        <Button size="small" color="error" onClick={() => setConfirm({ open: true, id: r.id })}>Hapus</Button>
      </Box>
    )},
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Grid container spacing={1} sx={{ width: 'auto' }} alignItems="end">
          <Grid item>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <InputLabel>Bulan</InputLabel>
              <Select value={genBulan} label="Bulan" onChange={e => setGenBulan(e.target.value as number)}>
                {['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'].map((n, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{n}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <TextField size="small" label="Tahun" type="number" value={genTahun} onChange={e => setGenTahun(parseInt(e.target.value) || 2026)} sx={{ width: 80 }} />
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={handleGenerate} disabled={genLoading}>
              {genLoading ? <CircularProgress size={20} /> : 'Generate Tagihan'}
            </Button>
          </Grid>
        </Grid>
        <Button variant="contained" onClick={openAdd}>Tambah Iuran</Button>
      </Box>
      <DataTable columns={columns} data={data} searchPlaceholder="Cari iuran..." searchKeys={['nama']} downloadFilename="iuran.xlsx" />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>{editId ? 'Edit Iuran' : 'Tambah Iuran'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Nama Iuran" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
            <TextField label="Nominal Dihuni / Kontrak (Rp)" type="number" value={form.nominal_dihuni} onChange={(e) => setForm({ ...form, nominal_dihuni: e.target.value })} required />
            <TextField label="Nominal Belum Dihuni (Rp)" type="number" value={form.nominal_belum_dihuni} onChange={(e) => setForm({ ...form, nominal_belum_dihuni: e.target.value })} required />
            <FormControl fullWidth>
              <InputLabel>Periode</InputLabel>
              <Select value={form.periode} label="Periode" onChange={(e) => setForm({ ...form, periode: e.target.value })}>
                <MenuItem value="bulanan">Bulanan</MenuItem>
                <MenuItem value="tahunan">Tahunan</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Keterangan" multiline rows={2} value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Batal</Button>
          <Button variant="contained" onClick={handleSave}>Simpan</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog open={confirm.open} title="Hapus Iuran" message="Yakin ingin menghapus iuran ini? Data tidak dapat dikembalikan." confirmLabel="Hapus" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
