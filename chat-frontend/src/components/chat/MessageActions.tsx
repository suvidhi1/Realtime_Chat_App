import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  ListItemIcon,
  Typography,
} from '@mui/material';
import {
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon, // FIXED: Changed from Copy to ContentCopy
} from '@mui/icons-material';
import { Message } from '../../types';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface MessageActionsProps {
  anchorEl: null | HTMLElement;
  onClose: () => void;
  message: Message;
  isOwn: boolean;
  onReply: (message: Message) => void;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  anchorEl,
  onClose,
  message,
  isOwn,
  onReply,
  onEdit,
  onDelete,
}) => {
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isLoading, setIsLoading] = useState(false);

  const handleReply = () => {
    onReply(message);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('Message copied to clipboard');
    onClose();
  };

  const handleEditSubmit = async () => {
    if (!editContent.trim() || editContent === message.content) {
      setEditDialog(false);
      return;
    }

    setIsLoading(true);
    try {
      await api.put(`/messages/${message._id}`, {
        content: editContent.trim()
      });
      
      onEdit(message._id, editContent.trim());
      toast.success('Message updated');
      setEditDialog(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to edit message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      await api.delete(`/messages/${message._id}`);
      
      onDelete(message._id);
      toast.success('Message deleted');
      setDeleteDialog(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleReply}>
          <ListItemIcon>
            <ReplyIcon fontSize="small" />
          </ListItemIcon>
          Reply
        </MenuItem>
        
        <MenuItem onClick={handleCopy}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          Copy
        </MenuItem>
        
        {isOwn && message.messageType === 'text' && (
          <MenuItem onClick={() => { setEditDialog(true); onClose(); }}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            Edit
          </MenuItem>
        )}
        
        {isOwn && (
          <MenuItem 
            onClick={() => { setDeleteDialog(true); onClose(); }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Message</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            maxRows={4}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            variant="outlined"
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={!editContent.trim() || editContent === message.content || isLoading}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Message</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this message? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isLoading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MessageActions;
