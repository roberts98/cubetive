import { Box, Container, Typography } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShareIcon from '@mui/icons-material/Share';
import { Hero, FeatureCard } from '../components';
import { Footer } from '../../../shared/components';

function LandingPage() {
  const features = [
    {
      icon: <TimerIcon sx={{ fontSize: 60, color: '#667eea' }} />,
      title: 'WCA-Standard Timer',
      description:
        'Professional speedcubing timer with spacebar controls, scramble generation, and penalty management. Practice like the pros with WCA-standard timing.',
    },
    {
      icon: <BarChartIcon sx={{ fontSize: 60, color: '#667eea' }} />,
      title: 'Comprehensive Statistics',
      description:
        'Track your progress with detailed statistics including Ao5, Ao12, Ao100, personal bests, and interactive charts showing your improvement over time.',
    },
    {
      icon: <ShareIcon sx={{ fontSize: 60, color: '#667eea' }} />,
      title: 'Public Profiles',
      description:
        'Share your achievements with the community. Create a public profile to showcase your personal bests and recent solves with friends and fellow cubers.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Hero
        title="Track, Analyze, and Share Your Speedcubing Progress"
        subtitle="WCA-standard timer with comprehensive statistics and public profiles"
        primaryCta={{ text: 'Sign Up', to: '/register' }}
        secondaryCta={{ text: 'Login', to: '/login' }}
      />

      {/* Feature Grid Section */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 600 }}
          >
            Everything You Need to Improve
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 4,
            }}
          >
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}

export default LandingPage;
