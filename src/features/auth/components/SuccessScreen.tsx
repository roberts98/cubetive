import { Container, Paper, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { ReactNode } from 'react';

interface SuccessScreenProps {
  title: string;
  message: string | ReactNode;
}

/**
 * Reusable success screen component
 * Displays a success message with check icon in the same layout as auth pages
 *
 * @param title - Success screen title
 * @param message - Success message or ReactNode to display
 *
 * @example
 * <SuccessScreen
 *   title="Password Updated Successfully"
 *   message="Your password has been changed. You will be redirected to the login page."
 * />
 */
function SuccessScreen({ title, message }: SuccessScreenProps) {
  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        {typeof message === 'string' ? (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            {message}
          </Typography>
        ) : (
          message
        )}
      </Paper>
    </Container>
  );
}

export default SuccessScreen;
