import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Chip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { Message } from '../../types';
import { getUserAvatar } from '../../utils/helpers';
import { formatDistanceToNow } from 'date-fns';
import MessageActions from './MessageActions';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  onReply,
  onEdit,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'image':
        return (
          <Box>
            {(message.fileData || message.fileUrl) && (
              <Box sx={{ mb: 1 }}>
                <img
                  src={message.fileData?.url || message.fileUrl}
                  alt={message.fileData?.fileName || message.fileName || 'Image'}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => window.open(message.fileData?.url || message.fileUrl, '_blank')}
                />
              </Box>
            )}
            {message.content && (
              <Typography variant="body2">
                {message.content}
              </Typography>
            )}
          </Box>
        );

      case 'file':
        return (
          <Box>
            <Paper
              elevation={1}
              sx={{
                p: 1,
                mb: message.content ? 1 : 0,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => window.open(message.fileData?.url || message.fileUrl, '_blank')}
            >
              <AttachFileIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {message.fileData?.fileName || message.fileName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {message.fileData?.fileSize ? formatFileSize(message.fileData.fileSize) :
                   message.fileSize ? formatFileSize(message.fileSize) : 'Unknown size'}
                </Typography>
              </Box>
              <IconButton size="small">
                <DownloadIcon />
              </IconButton>
            </Paper>
            {message.content && (
              <Typography variant="body2">
                {message.content}
              </Typography>
            )}
          </Box>
        );

      case 'system':
        return (
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <Chip
              label={message.content}
              size="small"
              variant="outlined"
              sx={{ bgcolor: 'background.paper' }}
            />
          </Box>
        );

      default:
        return (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>
        );
    }
  };

  if (message.messageType === 'system') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
        {renderMessageContent()}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        mb: 1,
        alignItems: 'flex-end',
      }}
    >
      {/* Avatar for other users */}
      {!isOwn && showAvatar && (
        <Avatar
          src={getUserAvatar(message.sender)}
          sx={{ width: 32, height: 32, mr: 1 }}
        >
          {message.sender.username.charAt(0).toUpperCase()}
        </Avatar>
      )}

      {/* Spacer when avatar is not shown */}
      {!isOwn && !showAvatar && <Box sx={{ width: 40 }} />}

      {/* Message Content */}
      <Box sx={{ maxWidth: '70%' }}>
        {/* Sender name for group chats */}
        {!isOwn && showAvatar && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {message.sender.username}
          </Typography>
        )}

        {/* Reply Context */}
        {message.replyTo && (
          <Paper
            elevation={0}
            sx={{
              p: 1,
              mb: 0.5,
              bgcolor: 'action.hover',
              borderLeft: 3,
              borderColor: 'primary.main',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Replying to {message.replyTo.sender.username}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              {message.replyTo.content.length > 50
                ? message.replyTo.content.substring(0, 50) + '...'
                : message.replyTo.content}
            </Typography>
          </Paper>
        )}

        {/* Message Bubble */}
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            bgcolor: isOwn ? 'primary.main' : 'background.paper',
            color: isOwn ? 'primary.contrastText' : 'text.primary',
            borderRadius: 2,
            position: 'relative',
            '&:hover .message-actions': {
              opacity: 1,
            },
          }}
        >
          {renderMessageContent()}

          {/* Message Info */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
                fontSize: '0.7rem',
              }}
            >
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              {message.edited && ' (edited)'}
            </Typography>

            {/* Message Actions */}
            <IconButton
              size="small"
              onClick={handleMenuClick}
              className="message-actions"
              sx={{
                opacity: 0,
                transition: 'opacity 0.2s',
                ml: 1,
                color: 'inherit',
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      </Box>

      {/* Message Actions Menu */}
      {onReply && onEdit && onDelete && (
        <MessageActions
          anchorEl={anchorEl}
          onClose={handleMenuClose}
          message={message}
          isOwn={isOwn}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </Box>
  );
};

export default MessageBubble;
