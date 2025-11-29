import { Box, Card, CardContent, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        p: 2,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          {icon}
        </Box>
        <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default FeatureCard;
