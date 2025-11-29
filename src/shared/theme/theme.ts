import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark', // Speedcubers prefer dark mode
    primary: {
      main: '#00bcd4', // Cyan (cube-inspired)
    },
    secondary: {
      main: '#ff6f00', // Orange
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: {
      fontSize: '4rem', // Timer display
      fontWeight: 300,
      fontVariantNumeric: 'tabular-nums', // Monospace numbers
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' }, // Disable uppercase
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});
