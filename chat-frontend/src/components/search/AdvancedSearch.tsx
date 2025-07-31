import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Tabs,
  Tab,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  Message as MessageIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useDebounce } from '../../hooks/useDebounce';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { getUserId, getUserAvatar, getChatId, getMessageId, isSameUser } from '../../utils/helpers';
import api from '../../services/api';
import { User, Chat, Message } from '../../types';
import toast from 'react-hot-toast';

interface AdvancedSearchProps {
  open: boolean;
  onClose: () => void;
}

interface SearchResults {
  users: User[];
  chats: Chat[];
  messages: Message[];
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults>({
    users: [],
    chats: [],
    messages: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState('all');
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { setCurrentChat, createChat } = useChatStore();
  const { user } = useAuthStore();

  React.useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      performSearch(debouncedSearchQuery);
    } else {
      setSearchResults({ users: [], chats: [], messages: [] });
    }
  }, [debouncedSearchQuery, searchType]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      console.log('Performing search:', { query, type: searchType });
      
      let results: SearchResults = { users: [], chats: [], messages: [] };

      if (searchType === 'all' || searchType === 'users') {
        try {
          const userResponse = await api.get(`/search/users`, {
            params: { q: query, limit: 10 }
          });
          console.log('User search response:', userResponse.data);
          results.users = userResponse.data.users || userResponse.data.data || userResponse.data || [];
        } catch (error) {
          console.error('User search failed:', error);
          try {
            const altResponse = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
            results.users = altResponse.data.users || altResponse.data.data || altResponse.data || [];
          } catch (altError) {
            console.error('Alternative user search also failed:', altError);
          }
        }
      }

      if (searchType === 'all' || searchType === 'chats') {
        try {
          const chatResponse = await api.get(`/search/chats`, {
            params: { q: query, limit: 10 }
          });
          console.log('Chat search response:', chatResponse.data);
          results.chats = chatResponse.data.chats || chatResponse.data.data || chatResponse.data || [];
        } catch (error) {
          console.error('Chat search failed:', error);
        }
      }

      if (searchType === 'all' || searchType === 'messages') {
        try {
          const messageResponse = await api.get(`/search/messages`, {
            params: { q: query, limit: 10 }
          });
          console.log('Message search response:', messageResponse.data);
          results.messages = messageResponse.data.messages || messageResponse.data.data || messageResponse.data || [];
        } catch (error) {
          console.error('Message search failed:', error);
        }
      }

      if (results.users.length === 0 && results.chats.length === 0 && results.messages.length === 0) {
        try {
          const globalResponse = await api.get(`/search/global`, {
            params: { q: query, type: searchType, limit: 20 }
          });
          console.log('Global search response:', globalResponse.data);
          
          results = {
            users: globalResponse.data.users || [],
            chats: globalResponse.data.chats || [],
            messages: globalResponse.data.messages || []
          };
        } catch (globalError) {
          console.error('Global search also failed:', globalError);
        }
      }

      // Filter out current user from results
      results.users = results.users.filter(searchUser => !isSameUser(searchUser, user));

      setSearchResults(results);
      console.log('Final search results:', results);
    } catch (error: any) {
      console.error('Search failed:', error);
      toast.error('Search failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserClick = async (selectedUser: User) => {
    try {
      const userId = getUserId(selectedUser);
      console.log('Starting chat with user:', userId);
      
      const chat = await createChat([userId], false);
      setCurrentChat(chat);
      toast.success(`Started chat with ${selectedUser.username}`);
      onClose();
    } catch (error: any) {
      console.error('Failed to start chat:', error);
      toast.error('Failed to start chat: ' + (error.message || 'Unknown error'));
    }
  };

  const handleChatClick = (chat: Chat) => {
    console.log('Opening chat:', chat);
    setCurrentChat(chat);
    onClose();
  };

  const handleMessageClick = async (message: Message) => {
    try {
      console.log('Opening message chat:', message);
      const chatId = typeof message.chat === 'string' ? message.chat : getChatId(message.chat as Chat);
      if (chatId) {
        const response = await api.get(`/chat/${chatId}`);
        const chat = response.data.chat || response.data;
        setCurrentChat(chat);
        onClose();
      }
    } catch (error: any) {
      console.error('Failed to open message chat:', error);
      toast.error('Failed to open chat: ' + (error.response?.data?.error || error.message));
    }
  };

  const sendFriendRequest = async (targetUser: User) => {
    try {
      const userId = getUserId(targetUser);
      console.log('Sending friend request to:', userId);
      await api.post('/users/friend-request', { userId });
      toast.success('Friend request sent!');
      
      setSearchResults(prev => ({
        ...prev,
        users: prev.users.filter(user => !isSameUser(user, targetUser))
      }));
    } catch (error: any) {
      console.error('Failed to send friend request:', error);
      toast.error('Failed to send friend request: ' + (error.response?.data?.error || error.message));
    }
  };

  const SearchResultsTab = ({ results, type }: { results: any[], type: string }) => (
    <List>
      {results.map((item) => (
        <ListItem key={getUserId(item) || getChatId(item) || getMessageId(item)} disablePadding>
          <ListItemButton
            onClick={() => {
              if (type === 'users') handleUserClick(item);
              else if (type === 'chats') handleChatClick(item);
              else if (type === 'messages') handleMessageClick(item);
            }}
          >
            <ListItemAvatar>
              <Avatar src={
                type === 'users' ? getUserAvatar(item) : 
                type === 'chats' ? item.groupAvatar : 
                getUserAvatar(item.sender)
              }>
                {type === 'users' ? (
                  <PersonIcon />
                ) : type === 'chats' ? (
                  item.isGroup ? <GroupIcon /> : <ChatIcon />
                ) : (
                  <MessageIcon />
                )}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                type === 'users' ? item.username :
                type === 'chats' ? (item.name || (item.isGroup ? 'Group Chat' : 'Direct Chat')) :
                item.content
              }
              secondary={
                type === 'users' ? item.email :
                type === 'chats' ? `${item.participants?.length || 0} members` :
                `From ${item.sender?.username} in ${item.chat?.name || 'Chat'}`
              }
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
              {type === 'users' && item.isOnline && (
                <Chip label="Online" size="small" color="success" />
              )}
              {type === 'users' && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    sendFriendRequest(item);
                  }}
                >
                  Add Friend
                </Button>
              )}
              {type === 'chats' && item.isGroup && (
                <Chip label="Group" size="small" color="primary" />
              )}
            </Box>
          </ListItemButton>
        </ListItem>
      ))}
      {results.length === 0 && !isSearching && searchQuery.trim() && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography color="text.secondary">
            No {type} found for "{searchQuery}"
          </Typography>
        </Box>
      )}
    </List>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Advanced Search</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search users, chats, messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: isSearching && (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Search Type</InputLabel>
            <Select
              value={searchType}
              label="Search Type"
              onChange={(e) => setSearchType(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="users">Users</MenuItem>
              <MenuItem value="chats">Chats</MenuItem>
              <MenuItem value="messages">Messages</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {searchQuery.trim() === '' && (
          <Alert severity="info">
            Start typing to search across users, chats, and messages.
          </Alert>
        )}

        {searchQuery.trim() !== '' && (
          <>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
              <Tab 
                label={`Users (${searchResults.users.length})`} 
                icon={<PersonIcon />}
                iconPosition="start"
              />
              <Tab 
                label={`Chats (${searchResults.chats.length})`} 
                icon={<ChatIcon />}
                iconPosition="start"
              />
              <Tab 
                label={`Messages (${searchResults.messages.length})`} 
                icon={<MessageIcon />}
                iconPosition="start"
              />
            </Tabs>

            <Box sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
              {activeTab === 0 && <SearchResultsTab results={searchResults.users} type="users" />}
              {activeTab === 1 && <SearchResultsTab results={searchResults.chats} type="chats" />}
              {activeTab === 2 && <SearchResultsTab results={searchResults.messages} type="messages" />}
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSearch;
