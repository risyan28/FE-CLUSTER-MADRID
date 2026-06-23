import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import HomeIcon from '@mui/icons-material/Home';

export default function Login() {
  const [hunianId, setHunianId] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/hunian-list').then(r => {
      setOptions(r.data);
      if (r.data.length === 1) setHunianId(String(r.data[0].id));
    }).catch(() => {});
  }, []);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      if (!hunianId) { setError('Pilih hunian atau nama warga'); setLoading(false); return; }
      await login({ hunian_id: parseInt(hunianId) });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f7ed 0%, #e8f5e3 40%, #f5f5f0 100%)',
        px: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(106,153,80,0.08) 0%, transparent 70%)',
          top: -60,
          right: -60,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(106,153,80,0.06) 0%, transparent 70%)',
          bottom: -40,
          left: -40,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: 380,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          component="img"
          src="/logo.jpeg"
          alt="Cluster Madrid"
          sx={{
            width: 200,
            height: 'auto',
            mb: 1,
            filter: 'drop-shadow(0 2px 8px rgba(106,153,80,0.15))',
          }}
        />

        <Typography
          variant="body1"
          fontWeight={500}
          color="text.secondary"
          mb={3}
          letterSpacing={2}
        >
          MANAJEMEN LINGKUNGAN
        </Typography>

        <Box
          sx={{
            width: '100%',
            bgcolor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            p: { xs: 2.5, sm: 3 },
            boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
            border: '1px solid rgba(106,153,80,0.1)',
          }}
        >
          <Autocomplete
            options={options}
            value={options.find(o => o.id === Number(hunianId)) || null}
            onChange={(_, v) => setHunianId(v ? String(v.id) : '')}
            getOptionLabel={(o) => `${o.label} — ${o.warga}`}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Cari hunian atau nama warga..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'white',
                    '& fieldset': { borderColor: 'rgba(106,153,80,0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(106,153,80,0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#6a9950' },
                  },
                }}
              />
            )}
            noOptionsText="Tidak ditemukan"
            fullWidth
            sx={{ mb: 2.5 }}
          />

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
                fontSize: '0.85rem',
              }}
            >
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleLogin}
            disabled={loading}
            sx={{
              py: 1.3,
              borderRadius: 2,
              fontSize: '0.95rem',
              fontWeight: 600,
              letterSpacing: 0.5,
              bgcolor: '#6a9950',
              '&:hover': { bgcolor: '#5a8743' },
              '&:active': { bgcolor: '#4d7639' },
              boxShadow: '0 4px 14px rgba(106,153,80,0.3)',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Masuk'}
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" mt={3} sx={{ opacity: 0.6 }}>
          RT 003 RW 016
        </Typography>
      </Box>
    </Box>
  );
}
