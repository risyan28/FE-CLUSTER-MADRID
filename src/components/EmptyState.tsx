import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = 'Tidak ada data' }: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
      <InboxIcon sx={{ fontSize: 64, mb: 1, opacity: 0.3 }} />
      <Typography variant="body1">{message}</Typography>
    </Box>
  );
}
