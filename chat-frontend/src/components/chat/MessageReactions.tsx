import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Popover,
  Typography,
  Chip,
  Grid,
} from '@mui/material';
import {
  AddReaction as AddReactionIcon,
  ThumbUp as ThumbUpIcon,
  Favorite as HeartIcon,
  TagFaces as LaughIcon,
  Whatshot as FireIcon,
  ThumbDown as ThumbDownIcon,
  SentimentVeryDissatisfied as SadIcon,
} from '@mui/icons-material';
import { Message, User } from '../../types';
import { getUserId } from '../../utils/helpers';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface MessageReactionsProps {
  message: Message;
  currentUser: User | null;
  onReactionUpdate: (messageId: string, reactions: any[]) => void;
}

interface Reaction {
  _id: string;
  emoji: string;
  users: User[];
  count: number;
}

const REACTION_EMOJIS = [
  { emoji: '👍', icon: ThumbUpIcon, label: 'Like' },
  { emoji: '❤️', icon: HeartIcon, label: 'Love' },
  { emoji: '😂', icon: LaughIcon, label: 'Laugh' },
  { emoji: '🔥', icon: FireIcon, label: 'Fire' },
  { emoji: '👎', icon: ThumbDownIcon, label: 'Dislike' },
  { emoji: '😢', icon: SadIcon, label: 'Sad' },
];

const MessageReactions: React.FC<MessageReactionsProps> = ({
  message,
  currentUser,
  onReactionUpdate,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [reactions, setReactions] = useState<Reaction[]>(
    (message as any).reactions || []
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleAddReaction = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const addReaction = async (emoji: string) => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const response = await api.post(`/messages/${message._id}/reactions`, {
        emoji,
      });

      const updatedReactions = response.data.reactions;
      setReactions(updatedReactions);
      onReactionUpdate(message._id, updatedReactions);
      
      handleClosePopover();
      toast.success('Reaction added!');
    } catch (error: any) {
      console.error('Failed to add reaction:', error);
      toast.error('Failed to add reaction');
    } finally {
      setIsLoading(false);
    }
  };

  const removeReaction = async (emoji: string) => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const response = await api.delete(`/messages/${message._id}/reactions`, {
        data: { emoji },
      });

      const updatedReactions = response.data.reactions;
      setReactions(updatedReactions);
      onReactionUpdate(message._id, updatedReactions);
      
      toast.success('Reaction removed!');
    } catch (error: any) {
      console.error('Failed to remove reaction:', error);
      toast.error('Failed to remove reaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactionClick = (emoji: string) => {
    const reaction = reactions.find(r => r.emoji === emoji);
    const userReacted = reaction?.users.some(u => getUserId(u) === getUserId(currentUser));
    
    if (userReacted) {
      removeReaction(emoji);
    } else {
      addReaction(emoji);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
      {/* Existing Reactions */}
      {reactions.map((reaction) => {
        const userReacted = reaction.users.some(u => getUserId(u) === getUserId(currentUser));
        
        return (
          <Chip
            key={reaction.emoji}
            label={`${reaction.emoji} ${reaction.count}`}
            size="small"
            variant={userReacted ? 'filled' : 'outlined'}
            color={userReacted ? 'primary' : 'default'}
            onClick={() => handleReactionClick(reaction.emoji)}
            sx={{
              height: 24,
              fontSize: '0.75rem',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          />
        );
      })}

      {/* Add Reaction Button */}
      <IconButton
        size="small"
        onClick={handleAddReaction}
        disabled={isLoading}
        sx={{
          width: 24,
          height: 24,
          opacity: 0.7,
          '&:hover': { opacity: 1 },
        }}
      >
        <AddReactionIcon fontSize="small" />
      </IconButton>

      {/* Reaction Picker Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
            Choose a reaction
          </Typography>
          <Grid container spacing={0.5}>
            {REACTION_EMOJIS.map(({ emoji, icon: Icon, label }) => (
              <Grid item key={emoji}>
                <IconButton
                  size="small"
                  onClick={() => addReaction(emoji)}
                  disabled={isLoading}
                  title={label}
                  sx={{
                    fontSize: '1.2rem',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  {emoji}
                </IconButton>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Popover>
    </Box>
  );
};

export default MessageReactions;
