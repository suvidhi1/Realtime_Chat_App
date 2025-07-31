import React from 'react';
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Palette as PaletteIcon,
  AutoMode as AutoModeIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { useThemeStore } from '../../store/themeStore';
import { themeVariants } from '../../theme';

const ThemeSettings: React.FC = () => {
  const theme = useTheme();
  const { mode, variant, autoDetect, setMode, setVariant, setAutoDetect, resetToDefaults } = useThemeStore();

  const variantOptions = [
    { key: 'blue', name: 'Ocean Blue', color: '#2196f3' },
    { key: 'purple', name: 'Royal Purple', color: '#9c27b0' },
    { key: 'green', name: 'Forest Green', color: '#4caf50' },
    { key: 'orange', name: 'Sunset Orange', color: '#ff9800' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Theme Mode Section */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaletteIcon />
          Theme Mode
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={autoDetect}
              onChange={(e) => setAutoDetect(e.target.checked)}
              icon={<LightModeIcon />}
              checkedIcon={<AutoModeIcon />}
            />
          }
          label="Auto-detect system theme"
          sx={{ mb: 2 }}
        />

        {!autoDetect && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant={mode === 'light' ? 'contained' : 'outlined'}
              startIcon={<LightModeIcon />}
              onClick={() => setMode('light')}
              sx={{ flex: 1 }}
            >
              Light Mode
            </Button>
            <Button
              variant={mode === 'dark' ? 'contained' : 'outlined'}
              startIcon={<DarkModeIcon />}
              onClick={() => setMode('dark')}
              sx={{ flex: 1 }}
            >
              Dark Mode
            </Button>
          </Box>
        )}
      </Paper>

      {/* Color Variant Section */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Color Scheme
        </Typography>
        
        <Grid container spacing={2}>
          {variantOptions.map((option) => (
            <Grid item xs={6} sm={3} key={option.key}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: variant === option.key ? 2 : 1,
                  borderColor: variant === option.key ? 'primary.main' : 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
                onClick={() => setVariant(option.key)}
              >
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: option.color,
                      margin: '0 auto 8px',
                      border: '3px solid white',
                      boxShadow: theme.shadows[2],
                    }}
                  />
                  <Typography variant="body2" fontWeight="medium">
                    {option.name}
                  </Typography>
                  {variant === option.key && (
                    <Chip
                      label="Active"
                      size="small"
                      color="primary"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Preview Section */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Preview
        </Typography>
        
        <Box sx={{ 
          p: 2, 
          borderRadius: 2, 
          backgroundColor: 'background.default',
          border: 1,
          borderColor: 'divider',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
              }}
            />
            <Typography variant="body1">
              Current theme: {mode} mode with {variantOptions.find(v => v.key === variant)?.name}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label="Primary" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }} />
            <Chip label="Secondary" sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }} />
            <Chip label="Background" variant="outlined" />
          </Box>
        </Box>
      </Paper>

      {/* Reset Section */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Reset Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Reset all theme settings to their default values.
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          onClick={resetToDefaults}
        >
          Reset to Defaults
        </Button>
      </Paper>
    </Box>
  );
};

export default ThemeSettings;
