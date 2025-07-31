import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import socketService from '../../services/socket';
import Sidebar from '../sidebar/Sidebar';
import ChatWindow from '../chat/ChatWindow';
import { Message, TypingUser } from '../../types';

const Layout: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { addMessage, addTypingUser, removeTypingUser } = useChatStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      if (token) {
        socketService.connect(token);
      }
      
      socketService.onNewMessage((message: Message) => {
        addMessage(message);
      });
      
      socketService.onUserTyping((data: TypingUser) => {
        addTypingUser(data);
      });
      
      socketService.onUserStoppedTyping((data: { userId: string; chatId: string }) => {
        removeTypingUser(data.userId, data.chatId);
      });

      return () => {
        socketService.removeAllListeners();
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, user, addMessage, addTypingUser, removeTypingUser]);

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: 350,
          height: '100vh',
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <Sidebar />
      </Box>

      {/* Chat Window */}
      <Box
        sx={{
          flex: 1,
          height: '100vh',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        <ChatWindow />
      </Box>
    </Box>
  );
};

export default Layout;
