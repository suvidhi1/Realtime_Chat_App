import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Badge,
  Chip,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Group as GroupIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { User } from '../../types';
import { getUserId, getUserAvatar, getChatId } from '../../utils/helpers';
import { formatDistanceToNow } from 'date-fns';
import CreateGroup from '../groups/CreateGroup';
import StartDirectChat from './StartDirectChat';

const ChatList: React.FC = () => {
  const { chats, currentChat, setCurrentChat, isLoading } = useChatStore();
  const { user } = useAuthStore();
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [startChatOpen, setStartChatOpen] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  const getChatDisplayName = (chat: any) => {
    if (chat.isGroup) {
      return chat.name || 'Group Chat';
    }
    
    const otherParticipant = chat.participants.find(
      (p: any) => getUserId(p) !== getUserId(user)
    );
    return otherParticipant?.username || 'Unknown User';
  };

  const getChatAvatar = (chat: any) => {
    if (chat.isGroup) {
      return chat.groupAvatar;
    }
    
    const otherParticipant = chat.participants.find(
      (p: any) => getUserId(p) !== getUserId(user)
    );
    return getUserAvatar(otherParticipant);
  };

  const getLastMessagePreview = (chat: any) => {
    if (!chat.lastMessage) return 'No messages yet';
    
    const message = chat.lastMessage;
    const isOwn = getUserId(message.sender) === getUserId(user);
    const prefix = isOwn ? 'You: ' : `${message.sender.username}: `;
    
    if (message.messageType === 'image') {
      return prefix + '📷 Photo';
    } else if (message.messageType === 'file') {
      return prefix + '📎 File';
    }
    
    return prefix + (message.content.length > 30 
      ? message.content.substring(0, 30) + '...' 
      : message.content);
  };

  const getLastMessageTime = (chat: any) => {
    if (!chat.lastMessage) return '';
    
    return formatDistanceToNow(new Date(chat.lastMessage.createdAt), {
      addSuffix: false,
    });
  };

  const getUnreadCount = (chat: any) => {
    return 0; // Placeholder
  };

  const handleChatClick = (chat: any) => {
    setCurrentChat(chat);
  };

  const speedDialActions = [
    {
      icon: <PersonIcon />,
      name: 'Start Direct Chat',
      onClick: () => {
        setStartChatOpen(true);
        setSpeedDialOpen(false);
      },
    },
    {
      icon: <GroupIcon />,
      name: 'Create Group',
      onClick: () => {
        setCreateGroupOpen(true);
        setSpeedDialOpen(false);
      },
    },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6" fontWeight="bold">
          Chats
        </Typography>
        <Chip 
          label={chats.length} 
          size="small" 
          color="primary" 
          variant="outlined"
        />
      </Box>

      {/* Chat List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">Loading chats...</Typography>
          </Box>
        ) : chats.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <ChatIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No chats yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start a conversation by clicking the + button
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {chats.map((chat) => {
              const isActive = currentChat && getChatId(currentChat) === getChatId(chat);
              const unreadCount = getUnreadCount(chat);
              
              return (
                <ListItem key={getChatId(chat)} disablePadding>
                  <ListItemButton
                    selected={Boolean(isActive)}
                    onClick={() => handleChatClick(chat)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      '&.Mui-selected': {
                        bgcolor: 'primary.50',
                        borderRight: 3,
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          unreadCount > 0 ? (
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: 'success.main',
                                border: 2,
                                borderColor: 'background.paper',
                              }}
                            />
                          ) : null
                        }
                      >
                        <Avatar
                          src={getChatAvatar(chat)}
                          sx={{ 
                            width: 48, 
                            height: 48,
                            bgcolor: chat.isGroup ? 'secondary.main' : 'primary.main'
                          }}
                        >
                          {chat.isGroup ? (
                            <GroupIcon />
                          ) : (
                            getChatDisplayName(chat).charAt(0).toUpperCase()
                          )}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={unreadCount > 0 ? 'bold' : 'normal'}
                            sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1,
                            }}
                          >
                            {getChatDisplayName(chat)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getLastMessageTime(chat)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1,
                              fontWeight: unreadCount > 0 ? 'medium' : 'normal',
                            }}
                          >
                            {getLastMessagePreview(chat)}
                          </Typography>
                          {unreadCount > 0 && (
                            <Chip
                              label={unreadCount}
                              size="small"
                              color="primary"
                              sx={{ ml: 1, minWidth: 20, height: 20 }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>

      {/* Speed Dial - Moved to LEFT BOTTOM */}
      <SpeedDial
        ariaLabel="New chat options"
        sx={{ 
          position: 'absolute', 
          bottom: 16, 
          left: 16,  // Changed from 'right: 16' to 'left: 16'
        }}
        icon={<SpeedDialIcon openIcon={<CloseIcon />} />}
        open={speedDialOpen}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
          />
        ))}
      </SpeedDial>

      {/* Dialogs */}
      <CreateGroup
        open={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
      />
      <StartDirectChat
        open={startChatOpen}
        onClose={() => setStartChatOpen(false)}
      />
    </Box>
  );
};

export default ChatList;
