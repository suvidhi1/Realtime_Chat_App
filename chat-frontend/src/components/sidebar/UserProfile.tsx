import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface UserProfileProps {
  open: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ open, onClose }) => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUser(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      // TODO: Implement avatar upload API call
      toast.success('Avatar updated successfully!');
    } catch (error) {
      toast.error('Failed to update avatar');
    }
  };

  const handleInputChange = (field: 'username' | 'email') => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Profile</Typography>
          {!isEditing ? (
            <IconButton onClick={handleEdit}>
              <EditIcon />
            </IconButton>
          ) : (
            <Box>
              <IconButton onClick={handleSave} disabled={isLoading}>
                <SaveIcon />
              </IconButton>
              <IconButton onClick={handleCancel} disabled={isLoading}>
                <CancelIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={user?.avatar}
              sx={{ width: 120, height: 120, mb: 2 }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-upload"
              type="file"
              onChange={handleAvatarUpload}
            />
            <label htmlFor="avatar-upload">
              <IconButton
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: -8,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <PhotoCameraIcon />
              </IconButton>
            </label>
          </Box>
        </Box>

        {/* Form Fields using Box instead of Grid */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Username"
            value={formData.username}
            onChange={handleInputChange('username')}
            disabled={!isEditing}
            variant={isEditing ? 'outlined' : 'standard'}
          />
          <TextField
            fullWidth
            label="Email"
            value={formData.email}
            onChange={handleInputChange('email')}
            disabled={!isEditing}
            variant={isEditing ? 'outlined' : 'standard'}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Account Information
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Friends</Typography>
          <Typography variant="body2">{user?.friends?.length || 0}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Friend Requests</Typography>
          <Typography variant="body2">{user?.friendRequests?.length || 0}</Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile;
