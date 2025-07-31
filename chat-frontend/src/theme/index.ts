import { createTheme, Theme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Define custom color palettes
export const lightPalette = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
    chat: '#f5f5f5',
    message: '#e3f2fd',
    messageOwn: '#1976d2',
  },
  text: {
    primary: '#000000',
    secondary: '#555555',
  },
  chat: {
    bubble: {
      own: '#1976d2',
      other: '#e0e0e0',
    },
    input: '#ffffff',
    sidebar: '#f8f9fa',
  },
};

export const darkPalette = {
  primary: {
    main: '#90caf9',
    light: '#bbdefb',
    dark: '#64b5f6',
    contrastText: '#000000',
  },
  secondary: {
    main: '#ce93d8',
    light: '#e1bee7',
    dark: '#ba68c8',
    contrastText: '#000000',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
    chat: '#2a2a2a',
    message: '#333333',
    messageOwn: '#90caf9',
  },
  text: {
    primary: '#ffffff',
    secondary: '#bbbbbb',
  },
  chat: {
    bubble: {
      own: '#90caf9',
      other: '#333333',
    },
    input: '#2a2a2a',
    sidebar: '#1a1a1a',
  },
};

// Custom theme variants
export const themeVariants = {
  blue: {
    light: { ...lightPalette, primary: { ...lightPalette.primary, main: '#2196f3' } },
    dark: { ...darkPalette, primary: { ...darkPalette.primary, main: '#64b5f6' } },
  },
  purple: {
    light: { ...lightPalette, primary: { ...lightPalette.primary, main: '#9c27b0' } },
    dark: { ...darkPalette, primary: { ...darkPalette.primary, main: '#ce93d8' } },
  },
  green: {
    light: { ...lightPalette, primary: { ...lightPalette.primary, main: '#4caf50' } },
    dark: { ...darkPalette, primary: { ...darkPalette.primary, main: '#81c784' } },
  },
  orange: {
    light: { ...lightPalette, primary: { ...lightPalette.primary, main: '#ff9800' } },
    dark: { ...darkPalette, primary: { ...darkPalette.primary, main: '#ffb74d' } },
  },
};

export const createAppTheme = (mode: PaletteMode, variant: string = 'blue'): Theme => {
  const palette = themeVariants[variant as keyof typeof themeVariants]?.[mode] || 
                  (mode === 'light' ? lightPalette : darkPalette);

  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            transition: 'background-color 0.3s ease, color 0.3s ease',
          },
          body: {
            '--chat-bg': palette.background.chat,
            '--message-bg': palette.background.message,
            '--sidebar-bg': palette.chat.sidebar,
            '--bubble-own': palette.chat.bubble.own,
            '--bubble-other': palette.chat.bubble.other,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: `1px solid ${mode === 'light' ? '#e0e0e0' : '#333333'}`,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 8px',
            '&:hover': {
              backgroundColor: mode === 'light' ? '#f5f5f5' : '#333333',
            },
            '&.Mui-selected': {
              backgroundColor: `${palette.primary.main}20`,
              '&:hover': {
                backgroundColor: `${palette.primary.main}30`,
              },
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 20,
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: `0 0 0 2px ${palette.primary.main}20`,
              },
              '&.Mui-focused': {
                boxShadow: `0 0 0 2px ${palette.primary.main}40`,
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 25,
            padding: '8px 24px',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${palette.primary.main}40`,
            },
          },
        },
      },
    },
  });
};
