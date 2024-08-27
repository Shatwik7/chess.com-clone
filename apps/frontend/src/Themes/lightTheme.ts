import { createTheme } from "@mui/material";

const lightTheme = createTheme({
    palette: {
      mode: 'light', // Specify light mode
      primary: {
        main: '#1976d2', // Blue
        contrastText: '#fff', // White text on primary
      },
      secondary: {
        main: '#dc004e', // Pink
        contrastText: '#fff', // White text on secondary
      },
      background: {
        default: '#fafafa', // Light gray background
        paper: '#fff', // White background for paper elements
      },
      text: {
        primary: '#000', // Black text for primary content
        secondary: '#555', // Dark gray text for secondary content
      },
      divider: '#e0e0e0', // Light gray divider
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 300,
        fontSize: '6rem',
        letterSpacing: '-0.01562em',
      },
      h2: {
        fontWeight: 300,
        fontSize: '3.75rem',
        letterSpacing: '-0.00833em',
      },
      h3: {
        fontWeight: 400,
        fontSize: '3rem',
        letterSpacing: '0em',
      },
      h4: {
        fontWeight: 400,
        fontSize: '2.125rem',
        letterSpacing: '0.00735em',
      },
      h5: {
        fontWeight: 400,
        fontSize: '1.5rem',
        letterSpacing: '0em',
      },
      h6: {
        fontWeight: 500,
        fontSize: '1.25rem',
        letterSpacing: '0.0075em',
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 400,
        color: '#666',
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#666',
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        color: '#333',
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        color: '#333',
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        textTransform: 'uppercase',
      },
      caption: {
        fontSize: '0.75rem',
        color: '#aaa',
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
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#115293',
            },
          },
          containedSecondary: {
            backgroundColor: '#dc004e',
            '&:hover': {
              backgroundColor: '#9a0036',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
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
    },
  });

  export default lightTheme;