import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Switch,
  FormControlLabel,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface UserSettingsProps {
  open: boolean;
  onClose: () => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ open, onClose }) => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    messages: user?.notificationSettings?.messages ?? true,
    friendRequests: user?.notificationSettings?.friendRequests ?? true,
    groupInvites: user?.notificationSettings?.groupInvites ?? true,
    sounds: user?.notificationSettings?.sounds ?? true,
    desktop: user?.notificationSettings?.desktop ?? true,
    email: user?.notificationSettings?.email ?? false,
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    onlineStatus: user?.privacySettings?.onlineStatus ?? true,
    lastSeen: user?.privacySettings?.lastSeen ?? true,
    readReceipts: user?.privacySettings?.readReceipts ?? true,
    profileVisibility: user?.privacySettings?.profileVisibility ?? 'friends',
  });

  // Theme settings
  const [themeSettings, setThemeSettings] = useState({
    theme: user?.themeSettings?.theme ?? 'light',
    fontSize: user?.themeSettings?.fontSize ?? 'medium',
    chatBackground: user?.themeSettings?.chatBackground ?? 'default',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleProfileSave = async () => {
    setIsLoading(true);
    try {
      await updateUser(profileData);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSave = async () => {
    setIsLoading(true);
    try {
      await updateUser({ notificationSettings });
      toast.success('Notification settings saved!');
    } catch (error: any) {
      toast.error('Failed to save notification settings: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacySave = async () => {
    setIsLoading(true);
    try {
      await updateUser({ privacySettings });
      toast.success('Privacy settings saved!');
    } catch (error: any) {
      toast.error('Failed to save privacy settings: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeSave = async () => {
    setIsLoading(true);
    try {
      await updateUser({ themeSettings });
      toast.success('Theme settings saved!');
    } catch (error: any) {
      toast.error('Failed to save theme settings: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const TabPanel = ({ children, value, index }: any) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>User Settings</DialogTitle>
      <DialogContent>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab icon={<PersonIcon />} label="Profile" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<SecurityIcon />} label="Privacy" />
          <Tab icon={<PaletteIcon />} label="Theme" />
        </Tabs>

        {/* Profile Tab */}
        <TabPanel value={activeTab} index={0}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Username"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                fullWidth
              />
              <TextField
                label="Email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                fullWidth
                type="email"
              />
              <TextField
                label="Bio"
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                fullWidth
                multiline
                rows={3}
                placeholder="Tell others about yourself..."
              />
              <Button
                variant="contained"
                onClick={handleProfileSave}
                disabled={isLoading}
              >
                Save Profile
              </Button>
            </Box>
          </Paper>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={activeTab} index={1}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.messages}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      messages: e.target.checked
                    })}
                  />
                }
                label="New Messages"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.friendRequests}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      friendRequests: e.target.checked
                    })}
                  />
                }
                label="Friend Requests"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.groupInvites}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      groupInvites: e.target.checked
                    })}
                  />
                }
                label="Group Invites"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.sounds}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      sounds: e.target.checked
                    })}
                  />
                }
                label="Sound Notifications"
              />
              <Button
                variant="contained"
                onClick={handleNotificationSave}
                disabled={isLoading}
                sx={{ mt: 2 }}
              >
                Save Notification Settings
              </Button>
            </Box>
          </Paper>
        </TabPanel>

        {/* Privacy Tab */}
        <TabPanel value={activeTab} index={2}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Privacy Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={privacySettings.onlineStatus}
                    onChange={(e) => setPrivacySettings({
                      ...privacySettings,
                      onlineStatus: e.target.checked
                    })}
                  />
                }
                label="Show Online Status"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={privacySettings.lastSeen}
                    onChange={(e) => setPrivacySettings({
                      ...privacySettings,
                      lastSeen: e.target.checked
                    })}
                  />
                }
                label="Show Last Seen"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={privacySettings.readReceipts}
                    onChange={(e) => setPrivacySettings({
                      ...privacySettings,
                      readReceipts: e.target.checked
                    })}
                  />
                }
                label="Send Read Receipts"
              />
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Profile Visibility</InputLabel>
                <Select
                  value={privacySettings.profileVisibility}
                  label="Profile Visibility"
                  onChange={(e) => setPrivacySettings({
                    ...privacySettings,
                    profileVisibility: e.target.value
                  })}
                >
                  <MenuItem value="everyone">Everyone</MenuItem>
                  <MenuItem value="friends">Friends Only</MenuItem>
                  <MenuItem value="nobody">Nobody</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={handlePrivacySave}
                disabled={isLoading}
                sx={{ mt: 2 }}
              >
                Save Privacy Settings
              </Button>
            </Box>
          </Paper>
        </TabPanel>

        {/* Theme Tab */}
        <TabPanel value={activeTab} index={3}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Appearance Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={themeSettings.theme}
                  label="Theme"
                  onChange={(e) => setThemeSettings({
                    ...themeSettings,
                    theme: e.target.value
                  })}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="auto">Auto (System)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Font Size</InputLabel>
                <Select
                  value={themeSettings.fontSize}
                  label="Font Size"
                  onChange={(e) => setThemeSettings({
                    ...themeSettings,
                    fontSize: e.target.value
                  })}
                >
                  <MenuItem value="small">Small</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                </Select>
              </FormControl>

              <Alert severity="info">
                Theme changes will be applied after saving and refreshing.
              </Alert>

              <Button
                variant="contained"
                onClick={handleThemeSave}
                disabled={isLoading}
              >
                Save Theme Settings
              </Button>
            </Box>
          </Paper>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserSettings;
