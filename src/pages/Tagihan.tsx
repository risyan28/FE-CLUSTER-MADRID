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
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import DataTable from '../components/DataTable';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function Tagihan() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ bulan_from: 1, bulan_to: new Date().getMonth() + 1, tahun: new Date().getFullYear(), status: '', status_warga: '' });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' as any });
  const [bayarOpen, setBayarOpen] = useState(false);
  const [bayarForm, setBayarForm] = useState({ tagihan_id: '', metode: 'tunai', nominal: '', keterangan: '' });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const load = async () => {
    try {
      const res = await api.get('/tagihan', { params: { bulan_from: filter.bulan_from, bulan_to: filter.bulan_to, tahun: filter.tahun, status: filter.status, status_warga: filter.status_warga } });
      setData(res.data);
    } catch (err) {
      setSnack({ open: true, message: 'Gagal memuat data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const openBayar = (tagihan: any) => {
    setBayarForm({ tagihan_id: tagihan.id, metode: 'tunai', nominal: tagihan.nominal, keterangan: '' });
    setBayarOpen(true);
  };

  const handleBayar = async () => {
    try {
      await api.post('/pembayaran', {
        tagihan_id: parseInt(bayarForm.tagihan_id), metode: bayarForm.metode,
        nominal: parseFloat(bayarForm.nominal) || undefined, keterangan: bayarForm.keterangan,
      });
      setSnack({ open: true, message: 'Pembayaran berhasil dicatat', severity: 'success' });
      setBayarOpen(false);
      load();
    } catch (err: any) {
      setSnack({ open: true, message: err.response?.data?.message || 'Gagal menyimpan', severity: 'error' });
    }
  };

  const handleVerifikasi = async () => {
    try {
      await api.put(`/pembayaran/${previewData.pembayaran.id}/verifikasi`);
      setSnack({ open: true, message: 'Pembayaran diverifikasi', severity: 'success' });
      setPreviewOpen(false);
      load();
    } catch (err: any) {
      setSnack({ open: true, message: 'Gagal verifikasi', severity: 'error' });
    }
  };

  const handleTolak = async () => {
    const alasan = window.prompt('Alasan penolakan:');
    if (!alasan) return;
    try {
      await api.put(`/pembayaran/${previewData.pembayaran.id}/tolak`, { alasan });
      setSnack({ open: true, message: 'Pembayaran ditolak', severity: 'info' });
      setPreviewOpen(false);
      load();
    } catch (err: any) {
      setSnack({ open: true, message: 'Gagal menolak', severity: 'error' });
    }
  };

  const openPreview = (row: any) => {
    setPreviewData(row);
    setPreviewOpen(true);
  };

  const columns = [
    { key: 'warga', label: 'Warga', render: (row: any) => row.warga?.nama || '-' },
    { key: 'blok', label: 'Blok', render: (row: any) => row.warga?.blok && row.warga?.nomor ? `${row.warga.blok}-${row.warga.nomor}` : '-' },
    { key: 'status_warga', label: 'Status Warga', render: (row: any) => {
      const s = row.warga?.status;
      if (s === 'Dihuni' || s === 'Dihuni/Kontrak') return <Chip label={s} color="success" size="small" />;
      if (s === 'Belum dihuni') return <Chip label="Belum Dihuni" color="warning" size="small" />;
      return '-';
    }},
    { key: 'iuran', label: 'Iuran', render: (row: any) => row.iuran?.nama || '-' },
    { key: 'periode', label: 'Periode', render: (row: any) => `${row.bulan}/${row.tahun}` },
    { key: 'nominal', label: 'Nominal', render: (row: any) => `Rp ${Number(row.nominal).toLocaleString()}` },
    { key: 'metode', label: 'Metode', render: (row: any) => {
      const p = row.pembayaran;
      if (row.status === 'lunas') return null;
      if (!p) return '-';
      if (p.metode === 'transfer') return <Chip label="Transfer Bank" color="primary" size="small" variant="outlined" />;
      if (p.metode === 'qris') return <Chip label="QRIS" color="secondary" size="small" variant="outlined" />;
      return <Chip label="Tunai" size="small" variant="outlined" />;
    }},
    { key: 'status', label: 'Status', render: (row: any) => {
      const p = row.pembayaran;
      if (row.status === 'lunas') return <Chip label="Lunas" color="success" size="small" />;
      if (p?.status === 'menunggu') return <Chip label="Menunggu Verifikasi" color="info" size="small" />;
      if (p?.status === 'ditolak') return <Chip label={`Ditolak`} color="error" size="small" />;
      return <Chip label="Belum Bayar" color="warning" size="small" />;
    }},
    { key: 'aksi', label: 'Aksi', render: (row: any) => {
      const p = row.pembayaran;
      if (row.status === 'lunas') return (
        <Button size="small" variant="outlined" fullWidth={isMobile} onClick={() => openPreview(row)}>Lihat</Button>
      );
      if (p?.status === 'menunggu') return (
        <Button size="small" variant="outlined" fullWidth={isMobile} onClick={() => openPreview(row)}>Lihat & Verifikasi</Button>
      );
      if (row.status !== 'lunas' && !p) return <Button size="small" variant="contained" fullWidth={isMobile} startIcon={<AddIcon />} onClick={() => openBayar(row)}>Catat Bayar</Button>;
      return null;
    }},
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <DataTable columns={columns} data={data} downloadFilename="tagihan.xlsx"
        extraFilters={
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, width: '100%' }}>
            <FormControl size="small" sx={{ minWidth: 0, flex: 1 }}>
              <InputLabel>Dari Bulan</InputLabel>
              <Select value={filter.bulan_from} label="Dari Bulan" onChange={e => setFilter({ ...filter, bulan_from: e.target.value as number })}>
                {['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'].map((n, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{n}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 0, flex: 1 }}>
              <InputLabel>Sampai Bulan</InputLabel>
              <Select value={filter.bulan_to} label="Sampai Bulan" onChange={e => setFilter({ ...filter, bulan_to: e.target.value as number })}>
                {['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'].map((n, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{n}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField size="small" label="Tahun" type="number" value={filter.tahun} onChange={e => setFilter({ ...filter, tahun: parseInt(e.target.value) })} sx={{ width: { xs: 100, sm: 100 }, flexShrink: 0 }} />
          </Box>
        }
        bottomFilters={
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <FormControl size="small" sx={{ flex: { xs: '1 1 45%', sm: '0 0 auto' }, minWidth: { sm: 150 } }}>
              <InputLabel>Status Pembayaran</InputLabel>
              <Select value={filter.status} label="Status Pembayaran" onChange={e => setFilter({ ...filter, status: e.target.value })}>
                <MenuItem value="">Semua</MenuItem>
                <MenuItem value="belum_lunas">Belum Bayar</MenuItem>
                <MenuItem value="menunggu">Menunggu Verifikasi</MenuItem>
                <MenuItem value="lunas">Lunas</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: { xs: '1 1 45%', sm: '0 0 auto' }, minWidth: { sm: 140 } }}>
              <InputLabel>Status Warga</InputLabel>
              <Select value={filter.status_warga} label="Status Warga" onChange={e => setFilter({ ...filter, status_warga: e.target.value })}>
                <MenuItem value="">Semua</MenuItem>
                <MenuItem value="Dihuni">Dihuni</MenuItem>
                <MenuItem value="Dihuni/Kontrak">Dihuni/Kontrak</MenuItem>
                <MenuItem value="Belum dihuni">Belum Dihuni</MenuItem>
              </Select>
            </FormControl>
          </Box>
        }
        searchPlaceholder="Cari nama warga, blok, atau iuran..." mobileTitleKey="warga" mobileSubtitleKeys={['blok', 'status_warga']} searchFn={(row, q) => {
        const nama = (row.warga?.nama || '').toLowerCase();
        const blok = (row.warga?.blok || '').toLowerCase();
        const nomor = (row.warga?.nomor || '').toLowerCase();
        const iuran = (row.iuran?.nama || '').toLowerCase();
        const blokNomor = `${blok}-${nomor}`;
        return nama.includes(q) || iuran.includes(q) || blok.includes(q) || nomor.includes(q) || blokNomor.includes(q);
      }} />
      <Dialog open={bayarOpen} onClose={() => setBayarOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>Catat Pembayaran</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Metode</InputLabel>
              <Select value={bayarForm.metode} label="Metode" onChange={e => setBayarForm({ ...bayarForm, metode: e.target.value })}>
                <MenuItem value="tunai">Tunai</MenuItem>
                <MenuItem value="transfer">Transfer Bank</MenuItem>
                <MenuItem value="qris">QRIS</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Nominal (Rp)" type="number" value={bayarForm.nominal} onChange={e => setBayarForm({ ...bayarForm, nominal: e.target.value })} />
            <TextField label="Keterangan" multiline rows={2} value={bayarForm.keterangan} onChange={e => setBayarForm({ ...bayarForm, keterangan: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBayarOpen(false)}>Batal</Button>
          <Button variant="contained" onClick={handleBayar}>Simpan</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>{previewData?.status === 'lunas' ? 'Detail Pembayaran' : 'Verifikasi Pembayaran'}</DialogTitle>
        <DialogContent>
          {previewData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Warga</Typography>
                  <Typography fontWeight={600}>{previewData.warga?.nama}</Typography>
                  <Typography variant="caption" color="text.secondary">{previewData.warga?.blok}-{previewData.warga?.nomor}</Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">Iuran</Typography>
                  <Typography fontWeight={600}>{previewData.iuran?.nama}</Typography>
                  <Typography variant="caption" color="text.secondary">Periode {previewData.bulan}/{previewData.tahun}</Typography>
                </Box>
              </Box>
              <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" mb={1}>Metode: <strong>{previewData.pembayaran?.metode === 'transfer' ? 'Transfer Bank' : previewData.pembayaran?.metode === 'qris' ? 'QRIS' : previewData.pembayaran?.metode}</strong> — Rp {Number(previewData.pembayaran?.nominal || previewData.nominal).toLocaleString()}</Typography>
                {previewData.pembayaran?.bukti_url ? (
                  <img src={previewData.pembayaran.bukti_url} alt="Bukti Bayar" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, border: '1px solid #ddd' }} />
                ) : (
                  <Typography color="text.secondary" sx={{ py: 3 }}>Tidak ada bukti diupload</Typography>
                )}
                {previewData.pembayaran?.tgl_bayar && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>Tanggal bayar: {previewData.pembayaran.tgl_bayar}</Typography>
                )}
                {previewData.status === 'lunas' && previewData.pembayaran?.verifikator && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>Diverifikasi oleh: <strong>{previewData.pembayaran.verifikator.nama}</strong></Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)} color="inherit">Tutup</Button>
          {previewData?.status !== 'lunas' && previewData?.pembayaran?.status !== 'lunas' && (
            <>
              <Button variant="outlined" color="error" onClick={handleTolak}>Tolak</Button>
              <Button variant="contained" color="success" onClick={handleVerifikasi}>Verifikasi</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
