import { createTheme } from "@mui/material";

const darkTheme = createTheme({
    palette: {
      mode: 'dark', // Set the mode to dark
      primary: {
        main: '#ffffff4d',
        contrastText: '#fff', // White text on primary
      },
      secondary: {
        main: '#dc004e', // Light pink
        contrastText: '#fff', // White text on secondary
      },
      background: {
        default: '#121212', // Dark background for the application
        paper: '#1e1e1e', // Slightly lighter dark background for paper components
      },
      text: {
        primary: '#e0e0e0', // Light gray text for primary content
        secondary: '#b0b0b0', // Gray text for secondary content
      },
      divider: '#333', // Dark gray divider
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 300,
        fontSize: '6rem',
        letterSpacing: '-0.01562em',
        color: '#e0e0e0', // Light gray color for headings
      },
      h2: {
        fontWeight: 300,
        fontSize: '3.75rem',
        letterSpacing: '-0.00833em',
        color: '#e0e0e0',
      },
      h3: {
        fontWeight: 400,
        fontSize: '3rem',
        letterSpacing: '0em',
        color: '#e0e0e0',
      },
      h4: {
        fontWeight: 400,
        fontSize: '2.125rem',
        letterSpacing: '0.00735em',
        color: '#e0e0e0',
      },
      h5: {
        fontWeight: 400,
        fontSize: '1.5rem',
        letterSpacing: '0em',
        color: '#e0e0e0',
      },
      h6: {
        fontWeight: 500,
        fontSize: '1.25rem',
        letterSpacing: '0.0075em',
        color: '#e0e0e0',
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 400,
        color: '#b0b0b0', // Gray color for subtitle text
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#b0b0b0',
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        color: '#e0e0e0', // Light gray color for body text
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        color: '#e0e0e0',
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        textTransform: 'uppercase',
      },
      caption: {
        fontSize: '0.75rem',
        color: '#888', // Slightly lighter gray for captions
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 400,
        textTransform: 'uppercase',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          containedPrimary: {
            backgroundColor: '#90caf9',
            '&:hover': {
              backgroundColor: '#64b5f6',
            },
          },
          containedSecondary: {
            backgroundColor: '#f48fb1',
            '&:hover': {
              backgroundColor: '#f06292',
            },
          },
          textPrimary: {
            color: '#e0e0e0',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: '#1e1e1e', // Dark background for drawer
          },
        },
      },
    },
  });
  export default darkTheme;