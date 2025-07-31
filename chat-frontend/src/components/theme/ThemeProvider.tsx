import React, { useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { useThemeStore } from '../../store/themeStore';
import { createAppTheme } from '../../theme';

interface AppThemeProviderProps {
  children: React.ReactNode;
}

const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const { mode, variant, autoDetect, setMode } = useThemeStore();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Handle system theme detection
  useEffect(() => {
    if (autoDetect) {
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, [prefersDarkMode, autoDetect, setMode]);

  // Set initial data attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const theme = createAppTheme(mode, variant);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default AppThemeProvider;
