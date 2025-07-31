import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert, TextField } from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

const FriendRequestDebug: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [testUserId, setTestUserId] = useState<string>('');
  const { user } = useAuthStore();

  const testSendRequest = async () => {
    try {
      setTestResult('Sending friend request...');
      const response = await api.post('/users/friend-request', {
        userId: testUserId
      });
      setTestResult(`✅ Success: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const testGetRequests = async () => {
    try {
      setTestResult('Getting friend requests...');
      const response = await api.get('/users/friend-requests');
      setTestResult(`✅ Requests: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const testSearchUsers = async () => {
    try {
      setTestResult('Searching users...');
      const response = await api.get('/users/search?query=test');
      setTestResult(`✅ Users: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const testGetFriends = async () => {
    try {
      setTestResult('Getting friends list...');
      const response = await api.get('/users/friends');
      setTestResult(`✅ Friends: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const testAcceptRequest = async () => {
    try {
      if (!testUserId) {
        setTestResult('❌ Please enter a request ID');
        return;
      }
      setTestResult('Accepting friend request...');
      const response = await api.put(`/users/friend-request/${testUserId}/accept`);
      setTestResult(`✅ Accept: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const testDeclineRequest = async () => {
    try {
      if (!testUserId) {
        setTestResult('❌ Please enter a request ID');
        return;
      }
      setTestResult('Declining friend request...');
      const response = await api.put(`/users/friend-request/${testUserId}/decline`);
      setTestResult(`✅ Decline: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <Paper sx={{ 
      p: 2, 
      position: 'fixed', 
      bottom: 20, 
      right: 20, 
      width: 400, 
      maxHeight: 600, 
      overflow: 'auto', 
      zIndex: 1000,
      bgcolor: 'background.paper',
      boxShadow: 3
    }}>
      <Typography variant="h6" gutterBottom color="primary">
        Friend Request Debug Panel
      </Typography>
      
      <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="medium">Current User:</Typography>
        <Typography variant="body2">{user?.username || 'Not logged in'}</Typography>
        <Typography variant="caption">ID: {user?.id || 'N/A'}</Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        <TextField
          size="small"
          label="User/Request ID"
          value={testUserId}
          onChange={(e) => setTestUserId(e.target.value)}
          placeholder="Enter user ID or request ID"
          helperText="For send: user ID, for accept/decline: request ID"
        />
        
        <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
          Friend Request Actions:
        </Typography>
        
        <Button 
          variant="outlined" 
          size="small" 
          onClick={testSendRequest}
          disabled={!testUserId.trim()}
          color="primary"
        >
          Send Friend Request
        </Button>
        
        <Button variant="outlined" size="small" onClick={testGetRequests}>
          Get My Friend Requests
        </Button>
        
        <Button variant="outlined" size="small" onClick={testGetFriends}>
          Get My Friends List
        </Button>
        
        <Button variant="outlined" size="small" onClick={testSearchUsers}>
          Search Users (test)
        </Button>
        
        <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
          Request Management:
        </Typography>
        
        <Button 
          variant="outlined" 
          size="small" 
          onClick={testAcceptRequest}
          disabled={!testUserId.trim()}
          color="success"
        >
          Accept Request (by ID)
        </Button>
        
        <Button 
          variant="outlined" 
          size="small" 
          onClick={testDeclineRequest}
          disabled={!testUserId.trim()}
          color="error"
        >
          Decline Request (by ID)
        </Button>
      </Box>
      
      {testResult && (
        <Alert 
          severity={testResult.includes('✅') ? 'success' : 'error'}
          sx={{ mt: 2 }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'monospace', 
              fontSize: '0.75rem', 
              whiteSpace: 'pre-wrap',
              maxHeight: 200,
              overflow: 'auto'
            }}
          >
            {testResult}
          </Typography>
        </Alert>
      )}
      
      <Box sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          Debug Panel - Test friend request functionality
        </Typography>
      </Box>
    </Paper>
  );
};

export default FriendRequestDebug;
