import { Box, Container, Typography, Button } from '@mui/material';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterProps {
  links?: FooterLink[];
  copyrightText?: string;
}

function Footer({
  links = [
    { label: 'GitHub', href: 'https://github.com', external: true },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  copyrightText = '© 2025 Cubetive. All rights reserved.',
}: FooterProps) {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        bgcolor: 'grey.900',
        color: 'grey.300',
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2">{copyrightText}</Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {links.map((link) => (
              <Button
                key={link.label}
                component="a"
                href={link.href}
                {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
                sx={{ color: 'grey.300', textTransform: 'none' }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
