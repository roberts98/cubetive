import { Box, Container, Typography, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function LoginPage() {
  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Login
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mt: 2 }}>
          Login page coming soon...
        </Typography>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Typography
              component={RouterLink}
              to="/register"
              sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Sign Up
            </Typography>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default LoginPage;
