// src/components/chat/MessageInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
} from '@mui/icons-material';
import { useChatStore } from '../../store/chatStore';
import socketService from '../../services/socket';
import toast from 'react-hot-toast';

interface MessageInputProps {
  chatId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ chatId }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { sendMessage, error, clearError } = useChatStore();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (error) {
      console.error('Chat error:', error);
    }
  }, [error]);

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) {
      return;
    }

    const messageText = message.trim();
    console.log('Attempting to send message:', messageText);
    
    setIsSending(true);
    if (clearError) clearError();
    
    try {
      await sendMessage(chatId, messageText);
      setMessage('');
      handleStopTyping();
      console.log('Message sent successfully');
    } catch (error: any) {
      console.error('Failed to send message in component:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setMessage(value);

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      socketService.sendTyping(chatId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      socketService.stopTyping(chatId);
    }
  };

  const handleFileAttachment = () => {
    toast('File upload functionality coming soon!', {
      icon: 'ℹ️',
      duration: 3000,
    });
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        borderTop: 1, 
        borderColor: 'divider',
        borderRadius: 0
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type a message..."
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          variant="outlined"
          size="small"
          disabled={isSending}
          error={!!error}
          helperText={error}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton size="small" onClick={handleFileAttachment} disabled={isSending}>
                  <AttachFileIcon />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" disabled={isSending}>
                  <EmojiIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!message.trim() || isSending}
          sx={{ 
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
            '&:disabled': { bgcolor: 'grey.300' }
          }}
        >
          {isSending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        </IconButton>
      </Box>
    </Paper>
  );
};

export default MessageInput;
