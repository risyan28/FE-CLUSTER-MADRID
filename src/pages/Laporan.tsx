import { useState } from 'react';
import api from '../services/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function Laporan() {
  const [tab, setTab] = useState('iuran');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState({ bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear(), from: '', to: '' });
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({ open: false, message: '', severity: 'success' });

  const generateLaporan = async (type) => {
    setLoading(true);
    try {
      let params = {};
      if (type === 'iuran') { params = { bulan: filter.bulan, tahun: filter.tahun }; }
      if (type === 'kas') { params = { from: filter.from || undefined, to: filter.to || undefined }; }
      const res = await api.get(`/laporan/${type}`, { params });
      setData(res.data);
    } catch (err) {
      setSnack({ open: true, message: 'Gagal generate laporan', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    if (!data?.data?.length) return;
    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.json_to_sheet(data.data.map(d => ({
        Warga: d.warga?.nama || d.nama || '-',
        Iuran: d.iuran?.nama || d.kategori || '-',
        Nominal: d.nominal,
        Status: d.status || d.tipe || '-',
        Tanggal: d.tanggal || '-'
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
      XLSX.writeFile(wb, `laporan-${tab}-${Date.now()}.xlsx`);
    });
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Laporan</Typography>
      <Tabs value={tab} onChange={(_, v) => { setTab(v); setData(null); }} sx={{ mb: 2 }}>
        <Tab label="Laporan Iuran" value="iuran" />
        <Tab label="Laporan Kas" value="kas" />
        <Tab label="Data Warga" value="warga" />
      </Tabs>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        {tab === 'iuran' && (
          <>
            <TextField size="small" label="Bulan" type="number" value={filter.bulan} onChange={(e) => setFilter({ ...filter, bulan: parseInt(e.target.value) || 1 })} sx={{ width: 100 }} />
            <TextField size="small" label="Tahun" type="number" value={filter.tahun} onChange={(e) => setFilter({ ...filter, tahun: parseInt(e.target.value) || new Date().getFullYear() })} sx={{ width: 100 }} />
            <Button variant="contained" onClick={() => generateLaporan('iuran')} disabled={loading}>Generate</Button>
          </>
        )}
        {tab === 'kas' && (
          <>
            <TextField size="small" label="Dari Tanggal" type="date" value={filter.from} onChange={(e) => setFilter({ ...filter, from: e.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField size="small" label="Sampai Tanggal" type="date" value={filter.to} onChange={(e) => setFilter({ ...filter, to: e.target.value })} InputLabelProps={{ shrink: true }} />
            <Button variant="contained" onClick={() => generateLaporan('kas')} disabled={loading}>Generate</Button>
          </>
        )}
        {tab === 'warga' && (
          <Button variant="contained" onClick={() => generateLaporan('warga')} disabled={loading}>Generate</Button>
        )}
        {data && <Button variant="outlined" onClick={downloadExcel}>Download Excel</Button>}
      </Box>
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}
      {data && data.data?.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {tab === 'iuran' && (<><TableCell>Warga</TableCell><TableCell>Blok</TableCell><TableCell>Iuran</TableCell><TableCell>Periode</TableCell><TableCell>Nominal</TableCell><TableCell>Status</TableCell></>)}
                {tab === 'kas' && (<><TableCell>Tanggal</TableCell><TableCell>Tipe</TableCell><TableCell>Kategori</TableCell><TableCell>Keterangan</TableCell><TableCell>Nominal</TableCell></>)}
                {tab === 'warga' && (<><TableCell>Nama</TableCell><TableCell>No HP</TableCell><TableCell>Status</TableCell><TableCell>Blok</TableCell></>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data.map((item, i) => (
                <TableRow key={item.id || i}>
                  {tab === 'iuran' && (
                    <>
                      <TableCell>{item.warga?.nama}</TableCell>
                      <TableCell>{item.warga?.blok ? `${item.warga.blok}-${item.warga.nomor}` : '-'}</TableCell>
                      <TableCell>{item.iuran?.nama}</TableCell>
                      <TableCell>{item.bulan}/{item.tahun}</TableCell>
                      <TableCell>Rp {Number(item.nominal).toLocaleString()}</TableCell>
                      <TableCell><Chip label={item.status} color={item.status === 'lunas' ? 'success' : 'warning'} size="small" /></TableCell>
                    </>
                  )}
                  {tab === 'kas' && (
                    <>
                      <TableCell>{item.tanggal}</TableCell>
                      <TableCell><Chip label={item.tipe} color={item.tipe === 'masuk' ? 'success' : 'error'} size="small" /></TableCell>
                      <TableCell>{item.kategori}</TableCell>
                      <TableCell>{item.keterangan}</TableCell>
                      <TableCell>Rp {Number(item.nominal).toLocaleString()}</TableCell>
                    </>
                  )}
                  {tab === 'warga' && (
                    <>
                      <TableCell>{item.nama}</TableCell>
                      <TableCell>{item.no_hp}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>{item.blok ? `${item.blok}-${item.nomor}` : '-'}</TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {data && tab === 'iuran' && (
        <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
          <Typography>Total Tagihan: <strong>{data.totalTagihan}</strong></Typography>
          <Typography>Lunas: <strong>{data.totalLunas}</strong></Typography>
          <Typography>Total Nominal: <strong>Rp {Number(data.totalNominal).toLocaleString()}</strong></Typography>
        </Box>
      )}
      {data && tab === 'kas' && (
        <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
          <Typography>Total Masuk: <strong>Rp {Number(data.totalMasuk).toLocaleString()}</strong></Typography>
          <Typography>Total Keluar: <strong>Rp {Number(data.totalKeluar).toLocaleString()}</strong></Typography>
          <Typography>Saldo: <strong>Rp {Number(data.saldo).toLocaleString()}</strong></Typography>
        </Box>
      )}
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
