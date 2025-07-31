import React, { useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { getChatId, getUserId } from '../../utils/helpers';
import MessageBubble from './MessageBubble';
import { InfiniteScroll } from '../common/InfiniteScroll';

const MessageList: React.FC = () => {
  const { messages, isLoading, fetchMessages, currentChat } = useChatStore();
  const { user } = useAuthStore();
  const listRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);

  const loadMore = async () => {
    if (!currentChat) return;
    
    try {
      const newPage = page + 1;
      const chatId = getChatId(currentChat);
      await fetchMessages(chatId, newPage);
      setPage(newPage);
    } catch (error) {
      console.error('Failed to load more messages:', error);
      setHasMore(false);
    }
  };

  const handleReply = (message: any) => {
    // TODO: Implement reply functionality
    console.log('Reply to message:', message);
  };

  const handleEdit = (messageId: string, newContent: string) => {
    // TODO: Implement edit functionality
    console.log('Edit message:', messageId, newContent);
  };

  const handleDelete = (messageId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete message:', messageId);
  };

  if (isLoading && messages.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (messages.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          flexDirection: 'column',
          color: 'text.secondary',
        }}
      >
        <Typography variant="h6" gutterBottom>
          No messages yet
        </Typography>
        <Typography variant="body2">
          Send a message to start the conversation
        </Typography>
      </Box>
    );
  }

  return (
    <Box ref={listRef} sx={{ flex: 1, overflow: 'auto', p: 1 }}>
      <InfiniteScroll
        hasMore={hasMore}
        loadMore={loadMore}
        loader={<CircularProgress size={24} />}
        threshold={100}
        reverse
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {messages.map((message, index) => {
            const isOwn = getUserId(message.sender) === getUserId(user);
            const showAvatar = index === 0 || 
              getUserId(messages[index - 1]?.sender) !== getUserId(message.sender);

            return (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            );
          })}
        </Box>
      </InfiniteScroll>
    </Box>
  );
};

export default MessageList;
