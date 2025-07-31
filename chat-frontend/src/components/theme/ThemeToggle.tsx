import React from 'react';
import {
  IconButton,
  Tooltip,
  Box,
  useTheme,
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Brightness4 as Brightness4Icon,
} from '@mui/icons-material';
import { useThemeStore } from '../../store/themeStore';
import { animated, useSpring } from '@react-spring/web';

const ThemeToggle: React.FC = () => {
  const theme = useTheme();
  const { mode, toggleMode, autoDetect } = useThemeStore();

  const iconSpring = useSpring({
    transform: mode === 'dark' ? 'rotate(180deg)' : 'rotate(0deg)',
    config: { tension: 300, friction: 20 },
  });

  const getIcon = () => {
    if (autoDetect) return <Brightness4Icon />;
    return mode === 'light' ? <LightModeIcon /> : <DarkModeIcon />;
  };

  const getTooltip = () => {
    if (autoDetect) return 'Auto theme (follows system)';
    return mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  };

  return (
    <Tooltip title={getTooltip()}>
      <IconButton
        onClick={toggleMode}
        sx={{
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: theme.palette.primary.main + '20',
            transform: 'scale(1.1)',
          },
        }}
      >
        <animated.div style={iconSpring}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getIcon()}
          </Box>
        </animated.div>
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
