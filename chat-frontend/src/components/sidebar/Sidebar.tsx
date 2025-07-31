import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { getUserAvatar } from '../../utils/helpers';
import ChatList from './ChatList';
import SearchBar from './SearchBar';
import FriendsList from '../friends/FriendsList';
import UserSettings from '../settings/UserSettings';
import ThemeToggle from '../theme/ThemeToggle';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { chats } = useChatStore();
  const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        {/* Top Row - User info and theme toggle on right */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={getUserAvatar(user)}
              sx={{ width: 40, height: 40 }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {user?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Online
              </Typography>
            </Box>
          </Box>

          {/* Theme toggle and menu on the right */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ThemeToggle />
            <IconButton size="small" onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Search Bar */}
        <SearchBar />

        {/* Tab Navigation */}
        <Box sx={{ display: 'flex', mt: 2 }}>
          <Box
            onClick={() => setActiveTab('chats')}
            sx={{
              flex: 1,
              py: 1,
              textAlign: 'center',
              cursor: 'pointer',
              borderBottom: 2,
              borderColor: activeTab === 'chats' ? 'primary.main' : 'transparent',
              color: activeTab === 'chats' ? 'primary.main' : 'text.secondary',
            }}
          >
            <Typography variant="body2" fontWeight={activeTab === 'chats' ? 'bold' : 'normal'}>
              Chats
            </Typography>
          </Box>
          <Box
            onClick={() => setActiveTab('friends')}
            sx={{
              flex: 1,
              py: 1,
              textAlign: 'center',
              cursor: 'pointer',
              borderBottom: 2,
              borderColor: activeTab === 'friends' ? 'primary.main' : 'transparent',
              color: activeTab === 'friends' ? 'primary.main' : 'text.secondary',
            }}
          >
            <Typography variant="body2" fontWeight={activeTab === 'friends' ? 'bold' : 'normal'}>
              Friends
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Content Area - Takes remaining height */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {activeTab === 'chats' ? <ChatList /> : <FriendsList />}
      </Box>

      {/* Settings Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { setSettingsOpen(true); handleMenuClose(); }}>
          <SettingsIcon sx={{ mr: 2 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <LogoutIcon sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

      <UserSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </Box>
  );
};

export default Sidebar;
