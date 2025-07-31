import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const AuthPage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, register } = useAuthStore();
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(loginData.email, loginData.password);
      toast.success('Welcome back!');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await register(registerData.username, registerData.email, registerData.password);
      toast.success('Account created successfully!');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #232526 0%, #414345 100%)',
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 4,
            backdropFilter: 'blur(10px)',
            background: theme.palette.mode === 'light'
              ? 'rgba(255, 255, 255, 0.9)'
              : 'rgba(30, 30, 30, 0.9)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <ChatIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Chat App
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Connect with friends and family instantly
            </Typography>
          </Box>

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab icon={<LoginIcon />} label="Login" />
            <Tab icon={<PersonAddIcon />} label="Register" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {activeTab === 0 && (
            <Box component="form" onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
                disabled={isLoading}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                disabled={isLoading}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
                sx={{ py: 1.5 }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>
          )}

          {activeTab === 1 && (
            <Box component="form" onSubmit={handleRegister}>
              <TextField
                fullWidth
                label="Username"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                required
                disabled={isLoading}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
                disabled={isLoading}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
                disabled={isLoading}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                required
                disabled={isLoading}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <PersonAddIcon />}
                sx={{ py: 1.5 }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

// This is the key fix - proper default export
export default AuthPage;
