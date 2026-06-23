import { useState, useMemo, useCallback, isValidElement } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import DownloadIcon from '@mui/icons-material/Download';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

interface Column {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  searchPlaceholder?: string;
  searchKeys?: string[];
  searchFn?: (row: any, query: string) => boolean;
  defaultRowsPerPage?: number;
  emptyMessage?: string;
  extraFilters?: React.ReactNode;
  downloadFilename?: string;
  mobileTitleKey?: string;
  mobileSubtitleKeys?: string[];
  bottomFilters?: React.ReactNode;
}

export default function DataTable({ columns, data, searchPlaceholder, searchKeys, searchFn, defaultRowsPerPage = 10, emptyMessage = 'Tidak ada data', extraFilters, downloadFilename, mobileTitleKey, mobileSubtitleKeys, bottomFilters }: DataTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getVal = (row: any, key: string) => key.split('.').reduce((o, k) => o?.[k], row);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    if (searchFn) return data.filter(row => searchFn(row, q));
    if (!searchKeys?.length) return data;
    return data.filter(row => searchKeys.some(k => String(getVal(row, k) || '').toLowerCase().includes(q)));
  }, [data, search, searchKeys, searchFn]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangeRowsPerPage = (e: any) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  const resolveValue = (row: any, col: Column): any => {
    if (col.render) {
      const el = col.render(row);
      if (typeof el === 'string' || typeof el === 'number') return el;
      if (isValidElement(el)) {
        const props = (el as any).props;
        return props?.label || props?.children;
      }
      return el;
    }
    return row[col.key];
  };

  const handleDownload = useCallback(async () => {
    const XLSX = await import('xlsx');
    const resolved = filtered.map((row, i) => {
      const obj: Record<string, any> = { No: i + 1 };
      columns.forEach(col => { obj[col.label] = resolveValue(row, col) ?? ''; });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(resolved);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, downloadFilename || 'data.xlsx');
  }, [filtered, columns, downloadFilename]);

  const titleCol = columns[0];
  const actionCol = columns[columns.length - 1];
  const infoCols = mobileTitleKey ? columns.filter(c => c.key !== mobileTitleKey && c.key !== actionCol.key && !(mobileSubtitleKeys || []).includes(c.key)) : columns.slice(1, 4);

  return (
    <Box>
      {/* Row 1: extraFilters */}
      {extraFilters && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          {extraFilters}
        </Box>
      )}

      {/* Row 2: search + show + pagination */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        {searchPlaceholder && (
          <TextField size="small" placeholder={searchPlaceholder} value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            sx={{ flex: 1, minWidth: 0 }} />
        )}
        <FormControl size="small" sx={{ minWidth: 55, flexShrink: 0 }}>
          <Select value={rowsPerPage} size="small" onChange={handleChangeRowsPerPage} notched sx={{ fontSize: '0.8rem', py: 0 }}>
            {[5, 10, 25].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <IconButton size="small" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" sx={{ minWidth: 36, textAlign: 'center' }}>{page + 1}/{totalPages}</Typography>
          <IconButton size="small" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {bottomFilters && (
        <Box sx={{ mb: 1 }}>{bottomFilters}</Box>
      )}

      {/* Desktop: Table */}
      {!isMobile && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 40 }} align="center">No</TableCell>
                {columns.map(col => (
                  <TableCell key={col.key} sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{col.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4, color: 'text.secondary' }}>{emptyMessage}</TableCell></TableRow>
              ) : paginated.map((row, i) => (
                <TableRow key={row.id || i} hover>
                  <TableCell align="center" sx={{ color: 'text.secondary' }}>{page * rowsPerPage + i + 1}</TableCell>
                  {columns.map(col => <TableCell key={col.key} sx={{ whiteSpace: 'nowrap' }}>{col.render ? col.render(row) : row[col.key]}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Mobile: Card list */}
      {isMobile && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {paginated.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>{emptyMessage}</Paper>
          ) : paginated.map((row, i) => (
            <Card key={row.id || i} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ minWidth: 0, flex: 1 }}>
                    {titleCol.render ? titleCol.render(row) : row[titleCol.key]}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 1 }}>
                    {mobileSubtitleKeys?.map(key => {
                      const col = columns.find(c => c.key === key);
                      if (!col) return null;
                      return <Box key={key}>{col.render ? col.render(row) : row[col.key]}</Box>;
                    })}
                  </Box>
                </Box>
                <Divider sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${infoCols.filter(c => (c.render ? c.render(row) : row[c.key]) && (c.render ? c.render(row) : row[c.key]) !== '-').length}, 1fr)`, gap: 1, mb: 1.5 }}>
                  {infoCols.map(col => {
                    const val = col.render ? col.render(row) : row[col.key];
                    if (!val || val === '-') return null;
                    return (
                      <Box key={col.key}>
                        <Typography variant="caption" color="text.secondary">{col.label}</Typography>
                        <Typography variant="body2" fontWeight={500}>{val}</Typography>
                      </Box>
                    );
                  })}
                </Box>
                {actionCol.render && (
                  <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    {actionCol.render(row)}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
