import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import socketService from '../../services/socket';
import api from '../../services/api';

const ConnectionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const { user, token } = useAuthStore();
  const { chats } = useChatStore();

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testApiConnection = async () => {
    try {
      addResult('Testing API connection...');
      const response = await api.get('/auth/me');
      addResult(`✅ API Connection: Success - User: ${response.data.user?.username}`);
    } catch (error: any) {
      addResult(`❌ API Connection: Failed - ${error.response?.data?.error || error.message}`);
    }
  };

  const testSocketConnection = () => {
    addResult('Testing Socket connection...');
    if (socketService.isSocketConnected()) {
      addResult('✅ Socket Connection: Connected');
    } else {
      addResult('❌ Socket Connection: Not connected');
      if (token) {
        socketService.connect(token);
        addResult('🔄 Attempting to reconnect socket...');
      }
    }
  };

  const testSendMessage = async () => {
    if (chats.length === 0) {
      addResult('❌ Send Message Test: No chats available');
      return;
    }

    const testChat = chats[0];
    try {
      addResult(`Testing message send to chat: ${testChat.id}`);
      const response = await api.post(`/chat/${testChat.id}/messages`, {
        content: 'Test message from debug panel',
        messageType: 'text'
      });
      addResult(`✅ Send Message: Success - Message ID: ${response.data.message?._id}`);
    } catch (error: any) {
      addResult(`❌ Send Message: Failed - ${error.response?.data?.error || error.message}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Connection Debug Panel
      </Typography>
      
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={testApiConnection}>
          Test API
        </Button>
        <Button variant="outlined" onClick={testSocketConnection}>
          Test Socket
        </Button>
        <Button variant="outlined" onClick={testSendMessage}>
          Test Send Message
        </Button>
        <Button variant="outlined" color="secondary" onClick={clearResults}>
          Clear
        </Button>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip 
          label={`User: ${user?.username || 'None'}`} 
          color={user ? 'success' : 'error'} 
        />
        <Chip 
          label={`Token: ${token ? 'Present' : 'Missing'}`} 
          color={token ? 'success' : 'error'} 
        />
        <Chip 
          label={`Socket: ${socketService.isSocketConnected() ? 'Connected' : 'Disconnected'}`} 
          color={socketService.isSocketConnected() ? 'success' : 'error'} 
        />
        <Chip 
          label={`Chats: ${chats.length}`} 
          color={chats.length > 0 ? 'success' : 'warning'} 
        />
      </Box>

      <List sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'grey.50' }}>
        {testResults.map((result, index) => (
          <ListItem key={index} dense>
            <ListItemText 
              primary={result}
              primaryTypographyProps={{ 
                variant: 'body2',
                fontFamily: 'monospace'
              }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default ConnectionTest;
