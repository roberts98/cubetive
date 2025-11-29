import { Box, Container, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface HeroProps {
  title: string;
  subtitle: string;
  primaryCta: {
    text: string;
    to: string;
  };
  secondaryCta: {
    text: string;
    to: string;
  };
}

function Hero({ title, subtitle, primaryCta, secondaryCta }: HeroProps) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: { xs: 8, md: 12 },
        width: '100%',
      }}
    >
      <Container maxWidth={false} sx={{ mx: 'auto', px: { xs: 3, md: 4 } }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '3.75rem' },
              mb: 2,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.95,
              fontWeight: 400,
              fontSize: { xs: '1.25rem', md: '1.5rem' },
            }}
          >
            {subtitle}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={RouterLink}
              to={primaryCta.to}
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: '#667eea',
                px: 4,
                py: 1.5,
                fontSize: '1.125rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              {primaryCta.text}
            </Button>
            <Button
              component={RouterLink}
              to={secondaryCta.to}
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.125rem',
                fontWeight: 600,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {secondaryCta.text}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Hero;
