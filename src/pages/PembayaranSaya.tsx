import { useState, useEffect } from 'react';
import api from '../services/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import QrCodeIcon from '@mui/icons-material/QrCode';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import EmptyState from '../components/EmptyState';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function PembayaranSaya() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({ open: false, message: '', severity: 'success' });
  const [dialog, setDialog] = useState({ open: false, tagihan_id: null as number | null });
  const [metode, setMetode] = useState<'transfer' | 'qris' | ''>('');
  const [bendahara, setBendahara] = useState<{ bank: { name: string; account: string; holder: string }; qris: { url: string } | null } | null>(null);
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [buktiPreview, setBuktiPreview] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const handleBukti = (file: File | null) => {
    setBuktiFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setBuktiPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setBuktiPreview(null);
    }
  };
  const [filter, setFilter] = useState({ tahun: new Date().getFullYear() });

  const load = async () => {
    try {
      const [tagihanRes, bendaharaRes] = await Promise.all([
        api.get('/tagihan/saya', { params: filter }),
        api.get('/bendahara')
      ]);
      setData(tagihanRes.data);
      setBendahara(bendaharaRes.data);
    } catch (err) {
      setSnack({ open: true, message: 'Gagal memuat data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const openBayar = (tagihan_id: number) => {
    setDialog({ open: true, tagihan_id });
    setMetode('');
    setBuktiFile(null);
    setBuktiPreview(null);
  };

  const handleSubmit = async () => {
    if (!dialog.tagihan_id || !metode || !buktiFile) return;
    const formData = new FormData();
    formData.append('tagihan_id', String(dialog.tagihan_id));
    formData.append('metode', metode);
    formData.append('bukti', buktiFile);
    try {
      await api.post('/pembayaran/upload-bukti', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSnack({ open: true, message: 'Bukti berhasil diupload, menunggu verifikasi admin', severity: 'success' });
      setDialog({ open: false, tagihan_id: null });
      load();
    } catch (err) {
      setSnack({ open: true, message: 'Gagal upload', severity: 'error' });
    }
  };

  const copyRek = () => {
    if (bendahara?.bank?.account) {
      navigator.clipboard.writeText(bendahara.bank.account);
      setSnack({ open: true, message: 'No. rekening disalin!', severity: 'success' });
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" fontWeight={700}>Tagihan Saya</Typography>
        <Grid container spacing={1} sx={{ width: 'auto' }} alignItems="center">
          <Grid item>
            <TextField size="small" label="Tahun" type="number" value={filter.tahun} onChange={e => setFilter(f => ({ ...f, tahun: parseInt(e.target.value) || 2026 }))} sx={{ width: 100 }} />
          </Grid>
        </Grid>
      </Box>
      {/* Desktop: Table */}
      {!isMobile ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bulan</TableCell>
                <TableCell>Iuran</TableCell>
                <TableCell>Nominal</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow><TableCell colSpan={5}><EmptyState message="Tidak ada tagihan" /></TableCell></TableRow>
              ) : data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell><strong>{['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][item.bulan - 1]}</strong> {item.tahun}</TableCell>
                  <TableCell>{item.iuran?.nama}</TableCell>
                  <TableCell>Rp {Number(item.nominal).toLocaleString()}</TableCell>
                  <TableCell>
                    {(() => {
                      const p = item.pembayaran;
                      if (item.status === 'lunas') return <Chip label="Lunas" color="success" size="small" />;
                      if (p?.status === 'menunggu') return <Chip label="Menunggu Verifikasi" color="info" size="small" />;
                      if (p?.status === 'ditolak') return <Chip label="Ditolak" color="error" size="small" />;
                      return <Chip label="Belum Bayar" color="warning" size="small" />;
                    })()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const p = item.pembayaran;
                      if (item.status === 'lunas') return <Button size="small" variant="outlined" onClick={() => { setPreviewData(item); setPreviewOpen(true); }}>Lihat</Button>;
                      if (p?.status === 'menunggu') return <Button size="small" variant="outlined" onClick={() => { setPreviewData(item); setPreviewOpen(true); }}>Menunggu Verifikasi</Button>;
                      return <Button size="small" variant="contained" color={p?.status === 'ditolak' ? 'warning' : 'primary'} onClick={() => openBayar(item.id)}>{p?.status === 'ditolak' ? 'Bayar Ulang' : 'Bayar'}</Button>;
                    })()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {data.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}><EmptyState message="Tidak ada tagihan" /></Paper>
          ) : data.map((item) => {
            const p = item.pembayaran;
            const bulanName = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][item.bulan - 1];
            return (
              <Card key={item.id} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>{bulanName} {item.tahun}</Typography>
                    {(() => {
                      if (item.status === 'lunas') return <Chip label="Lunas" color="success" size="small" />;
                      if (p?.status === 'menunggu') return <Chip label="Menunggu Verifikasi" color="info" size="small" />;
                      if (p?.status === 'ditolak') return <Chip label="Ditolak" color="error" size="small" />;
                      return <Chip label="Belum Bayar" color="warning" size="small" />;
                    })()}
                  </Box>
                  <Divider sx={{ mb: 1.5 }} />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Iuran</Typography>
                      <Typography variant="body2" fontWeight={500}>{item.iuran?.nama}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Nominal</Typography>
                      <Typography variant="body2" fontWeight={500}>Rp {Number(item.nominal).toLocaleString()}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    {(() => {
                      if (item.status === 'lunas') return <Button size="small" variant="outlined" fullWidth onClick={() => { setPreviewData(item); setPreviewOpen(true); }}>Lihat Detail</Button>;
                      if (p?.status === 'menunggu') return <Button size="small" variant="outlined" fullWidth onClick={() => { setPreviewData(item); setPreviewOpen(true); }}>Menunggu Verifikasi</Button>;
                      return <Button size="small" variant="contained" fullWidth color={p?.status === 'ditolak' ? 'warning' : 'primary'} onClick={() => openBayar(item.id)}>{p?.status === 'ditolak' ? 'Bayar Ulang' : 'Bayar'}</Button>;
                    })()}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, tagihan_id: null })} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle>Bayar Iuran</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {!metode ? (
              <Box>
                <Typography variant="subtitle2" mb={2}>Pilih metode pembayaran:</Typography>
                <ToggleButtonGroup value={metode} exclusive onChange={(_, v) => v && setMetode(v)} fullWidth>
                  <ToggleButton value="transfer" sx={{ py: 2, flexDirection: 'column', gap: 1 }}>
                    <AccountBalanceIcon />
                    <span>Transfer Bank</span>
                  </ToggleButton>
                  {bendahara?.qris && (
                    <ToggleButton value="qris" sx={{ py: 2, flexDirection: 'column', gap: 1 }}>
                      <QrCodeIcon />
                      <span>QRIS</span>
                    </ToggleButton>
                  )}
                </ToggleButtonGroup>
              </Box>
            ) : metode === 'transfer' && bendahara?.bank ? (
              <Box>
                <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => { setMetode(''); setBuktiFile(null); setBuktiPreview(null); }} sx={{ mb: 2 }}>Kembali</Button>
                <Grid container spacing={2} alignItems="start">
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" fontWeight={600} mb={1}>Cara Bayar</Typography>
                    <Box sx={{ pl: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>1. Buka mobile banking / ATM</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>2. Transfer ke rekening di tengah</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>3. Nominal sesuai tagihan</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>4. Simpan bukti transfer</Typography>
                      <Typography variant="body2" color="text.secondary">5. Upload bukti di kolom kanan</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" fontWeight={600} mb={1}>Rekening Tujuan</Typography>
                    <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight={700}>{bendahara.bank.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="h5" fontWeight={800} color="primary.main" sx={{ letterSpacing: 2 }}>{bendahara.bank.account}</Typography>
                        <IconButton onClick={copyRek} color="primary" size="small"><ContentCopyIcon /></IconButton>
                      </Box>
                      <Typography variant="body2" color="text.secondary">a.n. {bendahara.bank.holder}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block' }}>Bendahara RT 03 RW 016 — Cluster Madrid</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" fontWeight={600} mb={1}>Upload Bukti</Typography>
                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px dashed #ccc', textAlign: 'center', minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} size="small">
                        {buktiFile ? buktiFile.name : 'Pilih File'}
                        <input type="file" accept="image/*" hidden onChange={(e) => handleBukti(e.target.files?.[0] || null)} />
                      </Button>
                      {buktiPreview && (
                        <Box sx={{ mt: 1.5 }}>
                          <img src={buktiPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, border: '1px solid #ddd' }} />
                        </Box>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>Bukti diverifikasi admin</Typography>
                  </Grid>
                </Grid>
              </Box>
            ) : metode === 'qris' && bendahara?.qris ? (
              <Box>
                <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => { setMetode(''); setBuktiFile(null); setBuktiPreview(null); }} sx={{ mb: 2 }}>Kembali</Button>
                <Grid container spacing={2} alignItems="start">
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" fontWeight={600} mb={1}>Cara Bayar</Typography>
                    <Box sx={{ pl: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>1. Buka e-wallet / mobile banking</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>2. Pilih "Scan QRIS"</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>3. Scan QRIS di tengah</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>4. Masukkan nominal sesuai tagihan</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>5. Konfirmasi pembayaran</Typography>
                      <Typography variant="body2" color="text.secondary">6. Simpan bukti & upload di kanan</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={600} mb={1}>Scan QRIS</Typography>
                    <img src={bendahara.qris.url} alt="QRIS" style={{ width: '100%', maxWidth: 180, display: 'block', margin: '0 auto', borderRadius: 8, border: '1px solid #ddd' }} />
                    <Button variant="outlined" size="small" startIcon={<DownloadIcon />} href={bendahara.qris.url} download sx={{ mt: 1 }}>Download</Button>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" fontWeight={600} mb={1}>Upload Bukti</Typography>
                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, border: '1px dashed #ccc', textAlign: 'center', minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} size="small">
                        {buktiFile ? buktiFile.name : 'Pilih File'}
                        <input type="file" accept="image/*" hidden onChange={(e) => handleBukti(e.target.files?.[0] || null)} />
                      </Button>
                      {buktiPreview && (
                        <Box sx={{ mt: 1.5 }}>
                          <img src={buktiPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, border: '1px solid #ddd' }} />
                        </Box>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>Bukti diverifikasi admin</Typography>
                  </Grid>
                </Grid>
              </Box>
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialog({ open: false, tagihan_id: null }); setMetode(''); setBuktiFile(null); }}>Batal</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!metode || !buktiFile}>
            Kirim Bukti
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>{previewData?.status === 'lunas' ? 'Detail Pembayaran' : 'Status Pembayaran'}</DialogTitle>
        <DialogContent>
          {previewData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Iuran</Typography>
                  <Typography fontWeight={600}>{previewData.iuran?.nama}</Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">Periode</Typography>
                  <Typography fontWeight={600}>{['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][previewData.bulan - 1]} {previewData.tahun}</Typography>
                </Box>
              </Box>
              <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Metode: <strong>{previewData.pembayaran?.metode === 'transfer' ? 'Transfer Bank' : previewData.pembayaran?.metode === 'qris' ? 'QRIS' : previewData.pembayaran?.metode}</strong> — Rp {Number(previewData.pembayaran?.nominal || previewData.nominal).toLocaleString()}
                </Typography>
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
                {previewData.pembayaran?.status === 'ditolak' && (
                  <Typography variant="caption" color="error.main" display="block" mt={0.5}>Alasan penolakan: {previewData.pembayaran.keterangan}</Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)} color="inherit">Tutup</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
