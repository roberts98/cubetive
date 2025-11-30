import { Container, Paper, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface AuthPageLayoutProps {
  title: string;
  children: ReactNode;
}

function AuthPageLayout({ title, children }: AuthPageLayoutProps) {
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
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {title}
        </Typography>
        {children}
      </Paper>
    </Container>
  );
}

export default AuthPageLayout;
