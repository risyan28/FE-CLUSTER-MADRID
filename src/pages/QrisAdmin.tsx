import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

export default function QrisAdmin() {
  const [qris, setQris] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const res = await api.get('/qris');
      setQris(res.data.url ? res.data : null);
    } catch {
      setQris(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!previewFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('qris', previewFile);
    try {
      const res = await api.post('/qris/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setQris({ url: res.data.url });
      setPreview(null);
      setPreviewFile(null);
      setSnack({ open: true, message: 'QRIS berhasil disimpan', severity: 'success' });
    } catch {
      setSnack({ open: true, message: 'Gagal upload QRIS', severity: 'error' });
    }
    setUploading(false);
  };

  const handleCancel = () => {
    setPreview(null);
    setPreviewFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDelete = async () => {
    if (!window.confirm('Hapus QRIS?')) return;
    try {
      await api.delete('/qris');
      setQris(null);
      setSnack({ open: true, message: 'QRIS dihapus', severity: 'success' });
    } catch {
      setSnack({ open: true, message: 'Gagal menghapus', severity: 'error' });
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 500 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={1}>QRIS Statis</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Upload gambar QRIS static dari bendahara. Warga akan melihat QRIS ini saat memilih metode pembayaran QRIS.
          </Typography>

          {/* Preview sebelum save */}
          {preview && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" mb={1}>Preview:</Typography>
              <Box sx={{ textAlign: 'center', border: '2px dashed #1976d2', borderRadius: 2, p: 2, bgcolor: '#f5faff' }}>
                <img src={preview} alt="Preview QRIS" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8 }} />
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Button variant="contained" color="success" onClick={handleSave} disabled={uploading}>
                  {uploading ? <CircularProgress size={20} /> : 'Simpan QRIS'}
                </Button>
                <Button variant="outlined" onClick={handleCancel} disabled={uploading}>Batal</Button>
              </Box>
            </Box>
          )}

          {/* QRIS yg sudah tersimpan */}
          {!preview && qris?.url && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" mb={1}>QRIS Aktif:</Typography>
              <Box sx={{ textAlign: 'center', border: '1px solid #ddd', borderRadius: 2, p: 2 }}>
                <img src={qris.url} alt="QRIS" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8 }} />
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Button component="label" variant="outlined" size="small">
                  Ganti QRIS
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileSelect} />
                </Button>
                <Button variant="outlined" color="error" size="small" onClick={handleDelete}>Hapus</Button>
              </Box>
            </Box>
          )}

          {/* Belum ada QRIS + belum preview */}
          {!preview && !qris?.url && (
            <Box sx={{ textAlign: 'center', border: '2px dashed #ccc', borderRadius: 2, p: 4 }}>
              <Button component="label" variant="contained">
                Upload Gambar QRIS
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileSelect} />
              </Button>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Format: JPG, PNG, atau WEBP
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
