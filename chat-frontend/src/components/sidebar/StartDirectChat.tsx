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
  Typography,
  Box,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { getUserId, getUserAvatar } from '../../utils/helpers';
import { User } from '../../types';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface StartDirectChatProps {
  open: boolean;
  onClose: () => void;
}

const StartDirectChat: React.FC<StartDirectChatProps> = ({ open, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { createChat, setCurrentChat } = useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (open) {
      fetchFriends();
    }
  }, [open]);

  const fetchFriends = async () => {
    try {
      const response = await api.get('/users/friends');
      setFriends(response.data.friends);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.get(`/search/users?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const startChat = async (targetUser: User) => {
    try {
      setIsLoading(true);
      const userId = getUserId(targetUser);
      const chat = await createChat([userId], false);
      setCurrentChat(chat);
      toast.success(`Started chat with ${targetUser.username}`);
      onClose();
    } catch (error: any) {
      console.error('Failed to start chat:', error);
      toast.error(error.message || 'Failed to start chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  const usersToShow = searchQuery.trim() ? searchResults : friends;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Start Direct Chat</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Search users by username or email"
          fullWidth
          variant="outlined"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            searchUsers(e.target.value);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <Typography variant="subtitle2" gutterBottom>
          {searchQuery.trim() ? 'Search Results' : 'Your Friends'}
        </Typography>

        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
          {usersToShow.map((user) => (
            <ListItem key={getUserId(user)} disablePadding>
              <ListItemButton onClick={() => startChat(user)} disabled={isLoading}>
                <ListItemAvatar>
                  <Avatar src={getUserAvatar(user)}>
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.username}
                  secondary={user.email}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {usersToShow.length === 0 && !isLoading && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography color="text.secondary">
              {searchQuery.trim() ? 'No users found' : 'No friends available. Add friends first.'}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StartDirectChat;
