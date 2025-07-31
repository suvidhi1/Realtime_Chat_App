import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  Box,
  Chip,
  Menu,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  ExitToApp as LeaveIcon,
  MoreVert as MoreVertIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { Chat, User } from '../../types';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { getUserId, getUserAvatar } from '../../utils/helpers';


interface GroupSettingsProps {
  open: boolean;
  onClose: () => void;
  chat: Chat;
}

const GroupSettings: React.FC<GroupSettingsProps> = ({ open, onClose, chat }) => {
  const [groupName, setGroupName] = useState(chat.name || '');
  const [members, setMembers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [addMemberDialog, setAddMemberDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuthStore();
  const { updateChat, setCurrentChat } = useChatStore();

  const isAdmin = chat.admin?.id === user?.id;

  useEffect(() => {
    if (open) {
      fetchGroupMembers();
      fetchFriends();
    }
  }, [open]);

  const fetchGroupMembers = async () => {
    try {
      const response = await api.get(`/chat/${chat.id}/members`);
      setMembers(response.data.members);
    } catch (error) {
      console.error('Failed to fetch group members:', error);
      toast.error('Failed to fetch group members');
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await api.get('/users/friends');
      // Filter out users who are already in the group
      const availableFriends = response.data.friends.filter(
        (friend: User) => !chat.participants.some(p => p.id === friend.id)
      );
      setFriends(availableFriends);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    }
  };

  const updateGroupName = async () => {
    if (!isAdmin) {
      toast.error('Only admins can change group name');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.put(`/chat/${chat.id}`, {
        name: groupName.trim()
      });
      
      updateChat(response.data.chat);
      toast.success('Group name updated');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update group name');
    } finally {
      setIsLoading(false);
    }
  };

  const addMember = async (friendId: string) => {
    if (!isAdmin) {
      toast.error('Only admins can add members');
      return;
    }

    try {
      setIsLoading(true);
      await api.post(`/chat/${chat.id}/members`, { userId: friendId });
      
      fetchGroupMembers();
      fetchFriends();
      toast.success('Member added successfully');
      setAddMemberDialog(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!isAdmin) {
      toast.error('Only admins can remove members');
      return;
    }

    try {
      setIsLoading(true);
      await api.delete(`/chat/${chat.id}/members/${memberId}`);
      
      fetchGroupMembers();
      toast.success('Member removed successfully');
      handleMenuClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove member');
    } finally {
      setIsLoading(false);
    }
  };

  const leaveGroup = async () => {
    try {
      setIsLoading(true);
      await api.post(`/chat/${chat.id}/leave`);
      
      setCurrentChat(null);
      toast.success('Left the group');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to leave group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, member: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      toast.error('Only admins can change group avatar');
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.put(`/chat/${chat.id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      updateChat(response.data.chat);
      toast.success('Group avatar updated');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update avatar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Group Settings</Typography>
            {!isAdmin && (
              <Chip label="View Only" size="small" color="warning" />
            )}
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {/* Group Avatar */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={chat.groupAvatar}
                sx={{ width: 100, height: 100 }}
              >
                {chat.name?.charAt(0).toUpperCase()}
              </Avatar>
              {isAdmin && (
                <>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="group-avatar-upload"
                    type="file"
                    onChange={handleAvatarUpload}
                  />
                  <label htmlFor="group-avatar-upload">
                    <IconButton
                      component="span"
                      sx={{
                        position: 'absolute',
                        bottom: -5,
                        right: -5,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  </label>
                </>
              )}
            </Box>
          </Box>

          {/* Group Name */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={!isAdmin || isLoading}
              InputProps={{
                endAdornment: isAdmin && (
                  <IconButton
                    onClick={updateGroupName}
                    disabled={!groupName.trim() || groupName === chat.name || isLoading}
                  >
                    <EditIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>

          {/* Group Info */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Created: {new Date(chat.createdAt).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Members: {chat.participants.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Admin: {chat.admin?.username}
            </Typography>
          </Box>

          {/* Members List */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Members ({members.length})</Typography>
            {isAdmin && (
              <Button
                startIcon={<PersonAddIcon />}
                onClick={() => setAddMemberDialog(true)}
                disabled={friends.length === 0}
              >
                Add Member
              </Button>
            )}
          </Box>

          <List>
            {members.map((member) => (
              <ListItem
                key={member.id}
                secondaryAction={
                  isAdmin && member.id !== user?.id && (
                    <IconButton onClick={(e) => handleMenuOpen(e, member)}>
                      <MoreVertIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar src={member.avatar}>
                    {member.username.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {member.username}
                      {member.id === chat.admin?.id && (
                        <Chip label="Admin" size="small" color="primary" />
                      )}
                      {member.id === user?.id && (
                        <Chip label="You" size="small" variant="outlined" />
                      )}
                    </Box>
                  }
                  secondary={member.isOnline ? 'Online' : 'Offline'}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>

        <DialogActions>
          <Button
            startIcon={<LeaveIcon />}
            onClick={leaveGroup}
            color="error"
            disabled={isLoading}
          >
            Leave Group
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Member Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => selectedMember && removeMember(getUserId(selectedMember))}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Remove from Group
        </MenuItem>
      </Menu>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialog} onClose={() => setAddMemberDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Member</DialogTitle>
        <DialogContent>
          {friends.length === 0 ? (
            <Alert severity="info">
              No friends available to add. All your friends are already in this group.
            </Alert>
          ) : (
            <List>
              {friends.map((friend) => (
                <ListItem
                  key={friend.id}
                  secondaryAction={
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => addMember(getUserId(friend))}
                      disabled={isLoading}
                    >
                      Add
                    </Button>
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={friend.avatar}>
                      {friend.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={friend.username}
                    secondary={friend.isOnline ? 'Online' : 'Offline'}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GroupSettings;
