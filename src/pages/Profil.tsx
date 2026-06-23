import { useAuth } from '../contexts/AuthContext';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

export default function Profil() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <Box>
      <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 32 }}>
            {user.nama?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Typography variant="h5" fontWeight={700}>{user.nama}</Typography>
          <Chip label={user.role} color={user.role === 'admin' ? 'primary' : 'secondary'} sx={{ mt: 1 }} />
          <Box sx={{ mt: 3, textAlign: 'left' }}>
            <Typography variant="body2" color="text.secondary">Email</Typography>
            <Typography variant="body1" mb={2}>{user.email || '-'}</Typography>
            {user.role === 'warga' && (
              <>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Typography variant="body1" mb={2}>{user.status || '-'}</Typography>
                <Typography variant="body2" color="text.secondary">No HP</Typography>
                <Typography variant="body1" mb={2}>{user.no_hp || '-'}</Typography>
                <Typography variant="body2" color="text.secondary">Blok</Typography>
                <Typography variant="body1">{user.hunian ? `${user.hunian.blok}-${user.hunian.nomor}` : '-'}</Typography>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
