import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

const QuickTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const { user, token } = useAuthStore();

  const testAuth = async () => {
    try {
      setTestResult('Testing authentication...');
      const response = await api.get('/auth/me');
      setTestResult(`✅ Auth Success: ${response.data.user?.username}`);
    } catch (error: any) {
      setTestResult(`❌ Auth Failed: ${error.response?.data?.error || error.message}`);
    }
  };

  const testSendMessage = async () => {
    try {
      setTestResult('Testing message send...');
      
      // First, get chats to find a valid chat ID
      const chatsResponse = await api.get('/chat');
      const chats = chatsResponse.data.chats || chatsResponse.data || [];
      
      if (chats.length === 0) {
        setTestResult('❌ No chats found. Create a chat first.');
        return;
      }
      
      const testChatId = chats[0]._id || chats[0].id;
      console.log('Using chat ID:', testChatId);
      
      const response = await api.post(`/chat/${testChatId}/messages`, {
        content: 'Test message from debug panel',
        messageType: 'text'
      });
      
      setTestResult(`✅ Message sent successfully! ID: ${response.data.message?._id}`);
    } catch (error: any) {
      setTestResult(`❌ Message failed: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <Paper sx={{ p: 2, position: 'fixed', top: 80, right: 20, width: 300, zIndex: 1000 }}>
      <Typography variant="h6" gutterBottom>Quick Test</Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">User: {user?.username || 'None'}</Typography>
        <Typography variant="body2">Token: {token ? 'Present' : 'Missing'}</Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        <Button variant="outlined" size="small" onClick={testAuth}>
          Test Auth
        </Button>
        <Button variant="outlined" size="small" onClick={testSendMessage}>
          Test Send Message
        </Button>
      </Box>
      
      {testResult && (
        <Alert severity={testResult.includes('✅') ? 'success' : 'error'}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {testResult}
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default QuickTest;
