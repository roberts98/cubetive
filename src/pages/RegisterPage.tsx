import { Box, Container, Typography, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function RegisterPage() {
  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Sign Up
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mt: 2 }}>
          Registration page coming soon...
        </Typography>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Typography
              component={RouterLink}
              to="/login"
              sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Login
            </Typography>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default RegisterPage;
