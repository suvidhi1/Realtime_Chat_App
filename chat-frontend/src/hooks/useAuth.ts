import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import socketService from '../services/socket';

export const useAuth = () => {
  const { isAuthenticated, user, token, getCurrentUser } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on app load
    const storedToken = localStorage.getItem('token');
    if (storedToken && !isAuthenticated) {
      getCurrentUser();
    }
  }, [isAuthenticated, getCurrentUser]);

  useEffect(() => {
    // Connect socket when authenticated
    if (isAuthenticated && token && user) {
      socketService.connect(token);
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token, user]);

  return {
    isAuthenticated,
    user,
    token,
  };
};
