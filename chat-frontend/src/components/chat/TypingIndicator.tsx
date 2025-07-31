import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';

interface TypingIndicatorProps {
  chatId: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ chatId }) => {
  const { typingUsers } = useChatStore();
  const { user } = useAuthStore();

  const currentTypingUsers = typingUsers.filter(
    (typingUser) => typingUser.chatId === chatId && typingUser.userId !== user?.id
  );

  if (currentTypingUsers.length === 0) {
    return null;
  }

  const TypingDots = () => (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            animation: 'typingDots 1.4s infinite',
            animationDelay: `${i * 0.2}s`,
            '@keyframes typingDots': {
              '0%, 60%, 100%': {
                transform: 'scale(0.8)',
                opacity: 0.5,
              },
              '30%': {
                transform: 'scale(1)',
                opacity: 1,
              },
            },
          }}
        />
      ))}
    </Box>
  );

  const getTypingText = () => {
    if (currentTypingUsers.length === 1) {
      return `${currentTypingUsers[0].username} is typing`;
    } else if (currentTypingUsers.length === 2) {
      return `${currentTypingUsers[0].username} and ${currentTypingUsers[1].username} are typing`;
    } else {
      return `${currentTypingUsers.length} people are typing`;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1,
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TypingDots />
        <Typography variant="body2" color="text.secondary">
          {getTypingText()}
        </Typography>
      </Box>
    </Box>
  );
};

export default TypingIndicator;
