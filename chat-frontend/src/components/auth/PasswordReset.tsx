import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Container,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PasswordReset: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const steps = ['Enter Email', 'Enter Reset Code', 'Set New Password'];

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Reset code sent to your email!');
      setActiveStep(1);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to send reset code');
      toast.error(error.response?.data?.error || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/verify-reset-token', { email, token });
      toast.success('Code verified!');
      setActiveStep(2);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Invalid reset code');
      toast.error(error.response?.data?.error || 'Invalid reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/auth/reset-password', {
        email,
        token,
        newPassword,
      });
      toast.success('Password reset successful!');
      // Redirect to login after a delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to reset password');
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h4" gutterBottom>
              Reset Password
            </Typography>

            <Stepper activeStep={activeStep} sx={{ width: '100%', mt: 2, mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            {activeStep === 0 && (
              <Box component="form" onSubmit={handleRequestReset} sx={{ width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Send Reset Code'}
                </Button>
              </Box>
            )}

            {activeStep === 1 && (
              <Box component="form" onSubmit={handleVerifyToken} sx={{ width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="token"
                  label="Reset Code"
                  name="token"
                  autoFocus
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={isLoading}
                  helperText="Enter the code sent to your email"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Verify Code'}
                </Button>
              </Box>
            )}

            {activeStep === 2 && (
              <Box component="form" onSubmit={handleResetPassword} sx={{ width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Reset Password'}
                </Button>
              </Box>
            )}

            <Link component={RouterLink} to="/login" variant="body2">
              Back to Sign In
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PasswordReset;
