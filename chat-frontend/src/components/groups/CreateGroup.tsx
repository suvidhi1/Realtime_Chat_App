import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Checkbox,
  Typography,
  Box,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { User } from '../../types';
import { getUserId, getUserAvatar } from '../../utils/helpers';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface CreateGroupProps {
  open: boolean;
  onClose: () => void;
}

const CreateGroup: React.FC<CreateGroupProps> = ({ open, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const { createChat, setCurrentChat } = useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (open) {
      fetchFriends();
      setGroupName('');
      setSelectedFriends([]);
    }
  }, [open]);

  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching friends for group creation...');
      
      const response = await api.get('/users/friends');
      console.log('Friends response:', response.data);
      
      const friendsData = response.data.friends || response.data.data || response.data || [];
      setFriends(friendsData);
      console.log('Friends loaded for group:', friendsData.length);
    } catch (error: any) {
      console.error('Failed to fetch friends:', error);
      toast.error('Failed to fetch friends: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFriend = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (selectedFriends.length === 0) {
      toast.error('Please select at least one friend');
      return;
    }

    setIsCreating(true);
    try {
      console.log('Creating group:', {
        name: groupName.trim(),
        participants: selectedFriends,
        isGroup: true
      });

      const chat = await createChat(selectedFriends, true, groupName.trim());
      console.log('Group created:', chat);
      
      setCurrentChat(chat);
      toast.success('Group created successfully!');
      onClose();
      
      // Reset form
      setGroupName('');
      setSelectedFriends([]);
    } catch (error: any) {
      console.error('Failed to create group:', error);
      toast.error('Failed to create group: ' + (error.message || 'Unknown error'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setGroupName('');
      setSelectedFriends([]);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Group</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Group Name"
          fullWidth
          variant="outlined"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          disabled={isCreating}
          placeholder="Enter group name..."
          sx={{ mb: 2 }}
        />

        <Typography variant="subtitle2" gutterBottom>
          Select Friends ({selectedFriends.length} selected)
        </Typography>

        {selectedFriends.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedFriends.map(friendId => {
              const friend = friends.find(f => getUserId(f) === friendId);
              return friend ? (
                <Chip
                  key={friendId}
                  label={friend.username}
                  avatar={<Avatar src={getUserAvatar(friend)} sx={{ width: 24, height: 24 }} />}
                  onDelete={() => handleToggleFriend(friendId)}
                  size="small"
                  disabled={isCreating}
                />
              ) : null;
            })}
          </Box>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {friends.map((friend) => (
              <ListItem key={getUserId(friend)} disablePadding>
                <ListItemButton 
                  onClick={() => handleToggleFriend(getUserId(friend))}
                  disabled={isCreating}
                >
                  <Checkbox
                    checked={selectedFriends.includes(getUserId(friend))}
                    tabIndex={-1}
                    disableRipple
                    disabled={isCreating}
                  />
                  <ListItemAvatar>
                    <Avatar src={getUserAvatar(friend)}>
                      {friend.username?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={friend.username}
                    secondary={friend.isOnline ? 'Online' : 'Offline'}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}

        {friends.length === 0 && !isLoading && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No friends available. Add friends first to create a group.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isCreating}>
          Cancel
        </Button>
        <Button 
          onClick={handleCreateGroup} 
          variant="contained"
          disabled={isCreating || !groupName.trim() || selectedFriends.length === 0}
        >
          {isCreating ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          {isCreating ? 'Creating...' : 'Create Group'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroup;
