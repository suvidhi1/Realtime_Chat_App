import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Badge,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Chat as ChatIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  PersonRemove as PersonRemoveIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { User, FriendRequest } from '../../types';
import { getUserId, getUserAvatar, isSameUser } from '../../utils/helpers';
import api from '../../services/api';
import toast from 'react-hot-toast';

const FriendsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [addFriendDialog, setAddFriendDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const { user, getCurrentUser } = useAuthStore();
  const { createChat, setCurrentChat } = useChatStore();

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching friends...');
      const response = await api.get('/users/friends');
      console.log('Friends response:', response.data);
      
      const friendsData = response.data.friends || response.data.data || response.data || [];
      setFriends(friendsData);
      console.log('Friends loaded:', friendsData.length);
    } catch (error: any) {
      console.error('Failed to fetch friends:', error);
      toast.error('Failed to fetch friends: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      console.log('Fetching friend requests...');
      const response = await api.get('/users/friend-requests');
      console.log('Friend requests response:', response.data);
      
      const requestsData = response.data.friendRequests || response.data.data || response.data || [];
      setFriendRequests(requestsData);
      console.log('Friend requests loaded:', requestsData.length);
    } catch (error: any) {
      console.error('Failed to fetch friend requests:', error);
      toast.error('Failed to fetch friend requests: ' + (error.response?.data?.error || error.message));
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      console.log('Searching for users:', query);
      
      let response;
      try {
        response = await api.get(`/search/users?q=${encodeURIComponent(query)}`);
      } catch (error) {
        response = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
      }
      
      console.log('Search response:', response.data);
      
      let users = response.data.users || response.data.data || response.data || [];
      
      // Filter out current user and existing friends
      users = users.filter((searchUser: User) => 
        !isSameUser(searchUser, user) &&
        !friends.some(friend => isSameUser(friend, searchUser))
      );
      
      setSearchResults(users);
      console.log('Filtered search results:', users.length);
    } catch (error: any) {
      console.error('Search failed:', error);
      toast.error('Search failed: ' + (error.response?.data?.error || error.message));
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (targetUser: User) => {
    try {
      setIsLoading(true);
      const userId = getUserId(targetUser);
      console.log('Sending friend request to:', userId);
      
      const response = await api.post('/users/friend-request', { 
        userId: userId,
        targetUserId: userId
      });
      
      console.log('Friend request sent:', response.data);
      toast.success('Friend request sent!');
      
      // Remove from search results
      setSearchResults(prev => prev.filter(user => !isSameUser(user, targetUser)));
    } catch (error: any) {
      console.error('Failed to send friend request:', error);
      toast.error('Failed to send friend request: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const acceptFriendRequest = async (request: FriendRequest) => {
    try {
      setIsLoading(true);
      console.log('Accepting friend request:', request);
      
      let response;
      try {
        response = await api.put(`/users/friend-request/${request._id}/accept`);
      } catch (error) {
        response = await api.post(`/users/friend-request/accept`, { requestId: request._id });
      }
      
      console.log('Friend request accepted:', response.data);
      toast.success('Friend request accepted!');
      
      fetchFriends();
      fetchFriendRequests();
      getCurrentUser();
    } catch (error: any) {
      console.error('Failed to accept friend request:', error);
      toast.error('Failed to accept friend request: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const declineFriendRequest = async (request: FriendRequest) => {
    try {
      setIsLoading(true);
      console.log('Declining friend request:', request);
      
      let response;
      try {
        response = await api.put(`/users/friend-request/${request._id}/decline`);
      } catch (error) {
        response = await api.post(`/users/friend-request/decline`, { requestId: request._id });
      }
      
      console.log('Friend request declined:', response.data);
      toast.success('Friend request declined');
      fetchFriendRequests();
    } catch (error: any) {
      console.error('Failed to decline friend request:', error);
      toast.error('Failed to decline friend request: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const removeFriend = async (friend: User) => {
    try {
      setIsLoading(true);
      const friendId = getUserId(friend);
      console.log('Removing friend:', friendId);
      
      let response;
      try {
        response = await api.delete(`/users/friends/${friendId}`);
      } catch (error) {
        response = await api.post(`/users/friends/remove`, { friendId });
      }
      
      console.log('Friend removed:', response.data);
      toast.success('Friend removed');
      fetchFriends();
      getCurrentUser();
      handleMenuClose();
    } catch (error: any) {
      console.error('Failed to remove friend:', error);
      toast.error('Failed to remove friend: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const startChat = async (friend: User) => {
    try {
      setIsLoading(true);
      const friendId = getUserId(friend);
      console.log('Starting chat with:', friendId);
      
      const chat = await createChat([friendId], false);
      setCurrentChat(chat);
      toast.success(`Started chat with ${friend.username}`);
      handleMenuClose();
    } catch (error: any) {
      console.error('Failed to start chat:', error);
      toast.error('Failed to start chat: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, friend: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedFriend(friend);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFriend(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with Add Friend Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h6">Friends</Typography>
        <Button
          startIcon={<PersonAddIcon />}
          variant="outlined"
          size="small"
          onClick={() => setAddFriendDialog(true)}
        >
          Add Friend
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={`Friends (${friends.length})`} />
        <Tab 
          label={
            <Badge badgeContent={friendRequests.length} color="primary">
              Requests
            </Badge>
          }
        />
      </Tabs>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Friends Tab */}
        {activeTab === 0 && !isLoading && (
          <List>
            {friends.map((friend) => (
              <ListItem key={getUserId(friend)} disablePadding>
                <ListItemButton>
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      invisible={!friend.isOnline}
                      sx={{
                        '& .MuiBadge-badge': {
                          bgcolor: 'success.main',
                          color: 'success.main',
                        },
                      }}
                    >
                      <Avatar src={getUserAvatar(friend)}>
                        {friend.username?.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={friend.username}
                    secondary={friend.isOnline ? 'Online' : 'Offline'}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={() => startChat(friend)} size="small">
                      <ChatIcon />
                    </IconButton>
                    <IconButton onClick={(e) => handleMenuOpen(e, friend)} size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
            
            {friends.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="text.secondary" gutterBottom>
                  No friends yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start by adding some friends!
                </Typography>
                <Button
                  startIcon={<PersonAddIcon />}
                  onClick={() => setAddFriendDialog(true)}
                  sx={{ mt: 2 }}
                >
                  Add Friend
                </Button>
              </Box>
            )}
          </List>
        )}

        {/* Friend Requests Tab */}
        {activeTab === 1 && !isLoading && (
          <List>
            {friendRequests.map((request) => (
              <ListItem key={request._id} disablePadding>
                <ListItemButton>
                  <ListItemAvatar>
                    <Avatar src={getUserAvatar(request.from)}>
                      {request.from.username?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={request.from.username}
                    secondary={`Sent ${new Date(request.createdAt).toLocaleDateString()}`}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      color="success"
                      onClick={() => acceptFriendRequest(request)}
                      disabled={isLoading}
                      size="small"
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => declineFriendRequest(request)}
                      disabled={isLoading}
                      size="small"
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
            
            {friendRequests.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="text.secondary">
                  No friend requests
                </Typography>
              </Box>
            )}
          </List>
        )}
      </Box>

      {/* Friend Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedFriend && startChat(selectedFriend)}>
          <ChatIcon sx={{ mr: 1 }} />
          Start Chat
        </MenuItem>
        <MenuItem 
          onClick={() => selectedFriend && removeFriend(selectedFriend)}
          sx={{ color: 'error.main' }}
        >
          <PersonRemoveIcon sx={{ mr: 1 }} />
          Remove Friend
        </MenuItem>
      </Menu>

      {/* Add Friend Dialog */}
      <Dialog open={addFriendDialog} onClose={() => setAddFriendDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Friend</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search by username or email"
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
          
          {isSearching && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {searchResults.map((searchUser) => (
              <ListItem key={getUserId(searchUser)} disablePadding>
                <ListItemButton>
                  <ListItemAvatar>
                    <Avatar src={getUserAvatar(searchUser)}>
                      {searchUser.username?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={searchUser.username}
                    secondary={searchUser.email}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => sendFriendRequest(searchUser)}
                    disabled={isLoading}
                  >
                    Add Friend
                  </Button>
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No users found for "{searchQuery}". Try searching by exact username or email.
            </Alert>
          )}
          
          {!searchQuery.trim() && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Start typing to search for users by username or email.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddFriendDialog(false);
            setSearchQuery('');
            setSearchResults([]);
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FriendsList;
