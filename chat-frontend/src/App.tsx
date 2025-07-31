import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import AppThemeProvider from './components/theme/ThemeProvider';
import Layout from './components/layout/Layout';
import AuthPage from './pages/AuthPage';

const App: React.FC = () => {
  const { isAuthenticated, token, getCurrentUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      getCurrentUser();
    }
  }, [token, getCurrentUser]);

  return (
    <AppThemeProvider>
      <BrowserRouter>
        {isAuthenticated ? <Layout /> : <AuthPage />}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
          }}
        />
      </BrowserRouter>
    </AppThemeProvider>
  );
};

export default App;
