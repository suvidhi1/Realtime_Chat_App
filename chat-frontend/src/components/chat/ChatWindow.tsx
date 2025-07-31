import React, { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  VideoCall as VideoCallIcon,
  Call as CallIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { User } from '../../types';
import { getChatId, getUserId, getUserAvatar } from '../../utils/helpers';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { formatDistanceToNow } from 'date-fns';

const ChatWindow: React.FC = () => {
  const { currentChat, messages, fetchMessages, markMessagesAsRead } = useChatStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentChat) {
      const chatId = getChatId(currentChat);
      fetchMessages(chatId);
      markMessagesAsRead(chatId);
    }
  }, [currentChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getChatDisplayName = () => {
    if (!currentChat) return '';
    
    if (currentChat.isGroup) {
      return currentChat.name || 'Group Chat';
    }
    
    const otherParticipant = currentChat.participants.find((p: User) => getUserId(p) !== getUserId(user));
    return otherParticipant?.username || 'Unknown User';
  };

  const getChatAvatar = () => {
    if (!currentChat) return '';
    
    if (currentChat.isGroup) {
      return currentChat.groupAvatar;
    }
    
    const otherParticipant = currentChat.participants.find((p: User) => getUserId(p) !== getUserId(user));
    return getUserAvatar(otherParticipant);
  };

  const getOnlineStatus = () => {
    if (!currentChat || currentChat.isGroup) return '';
    
    const otherParticipant = currentChat.participants.find((p: User) => getUserId(p) !== getUserId(user));
    if (!otherParticipant) return '';
    
    if (otherParticipant.isOnline) {
      return 'Online';
    }
    
    if (otherParticipant.lastSeen) {
      return `Last seen ${formatDistanceToNow(new Date(otherParticipant.lastSeen), { addSuffix: true })}`;
    }
    
    return 'Offline';
  };

  if (!currentChat) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: 'text.secondary',
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight="light">
          Welcome to Chat App
        </Typography>
        <Typography variant="body1">
          Select a chat from the sidebar to start messaging
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={getChatAvatar()} sx={{ width: 40, height: 40 }}>
            {getChatDisplayName().charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {getChatDisplayName()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {currentChat.isGroup ? (
                <>
                  <Typography variant="caption" color="text.secondary">
                    {currentChat.participants.length} members
                  </Typography>
                  <Chip label="Group" size="small" />
                </>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  {getOnlineStatus()}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small">
            <CallIcon />
          </IconButton>
          <IconButton size="small">
            <VideoCallIcon />
          </IconButton>
          <IconButton size="small">
            <InfoIcon />
          </IconButton>
          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MessageList />
        <TypingIndicator chatId={getChatId(currentChat)} />
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <MessageInput chatId={getChatId(currentChat)} />
      </Box>
    </Box>
  );
};

export default ChatWindow;
