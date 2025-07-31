import React, { useState, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Paper,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useDebounce } from '../../hooks/useDebounce'; // Fixed path
import api from '../../services/api'; // Fixed path
import { User, Chat } from '../../types'; // Fixed path

// Rest of the component remains the same...


interface SearchResult {
  users: User[];
  chats: Chat[];
  messages: any[];
}

const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      performSearch(debouncedSearchTerm);
    } else {
      setSearchResults(null);
      setShowResults(false);
    }
  }, [debouncedSearchTerm]);

  const performSearch = async (query: string) => {
    try {
      setIsSearching(true);
      const response = await api.get(`/search/global?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchResults(null);
    setShowResults(false);
  };

  const handleUserClick = (user: User) => {
    // TODO: Start chat with user
    console.log('Start chat with:', user.username);
    setShowResults(false);
  };

  const handleChatClick = (chat: Chat) => {
    // TODO: Open chat
    console.log('Open chat:', chat.name);
    setShowResults(false);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        fullWidth
        placeholder="Search users, chats, messages..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <ClearIcon 
                sx={{ cursor: 'pointer', color: 'text.secondary' }}
                onClick={handleClear}
              />
            </InputAdornment>
          ),
        }}
      />

      {showResults && searchResults && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: '400px',
            overflow: 'auto',
            mt: 1,
          }}
        >
          <List>
            {/* Users */}
            {searchResults.users.length > 0 && (
              <>
                <ListItem>
                  <Typography variant="subtitle2" color="primary">
                    Users
                  </Typography>
                </ListItem>
                {searchResults.users.map((user) => (
                  <ListItem key={user.id} disablePadding>
                    <ListItemButton onClick={() => handleUserClick(user)}>
                      <ListItemAvatar>
                        <Avatar src={user.avatar} sx={{ width: 32, height: 32 }}>
                          {user.username.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.username}
                        secondary={user.email}
                      />
                      {user.isOnline && (
                        <Chip
                          label="Online"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </>
            )}

            {/* Chats */}
            {searchResults.chats.length > 0 && (
              <>
                <ListItem>
                  <Typography variant="subtitle2" color="primary">
                    Chats
                  </Typography>
                </ListItem>
                {searchResults.chats.map((chat) => (
                  <ListItem key={chat.id} disablePadding>
                    <ListItemButton onClick={() => handleChatClick(chat)}>
                      <ListItemAvatar>
                        <Avatar src={chat.groupAvatar} sx={{ width: 32, height: 32 }}>
                          {chat.name?.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={chat.name || 'Group Chat'}
                        secondary={`${chat.participants.length} members`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </>
            )}

            {/* Messages */}
            {searchResults.messages.length > 0 && (
              <>
                <ListItem>
                  <Typography variant="subtitle2" color="primary">
                    Messages
                  </Typography>
                </ListItem>
                {searchResults.messages.map((message) => (
                  <ListItem key={message._id} disablePadding>
                    <ListItemButton>
                      <ListItemAvatar>
                        <Avatar src={message.sender.avatar} sx={{ width: 32, height: 32 }}>
                          {message.sender.username.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={message.sender.username}
                        secondary={message.content}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </>
            )}

            {searchResults.users.length === 0 && 
             searchResults.chats.length === 0 && 
             searchResults.messages.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No results found"
                  secondary={`No results for "${searchTerm}"`}
                />
              </ListItem>
            )}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;
