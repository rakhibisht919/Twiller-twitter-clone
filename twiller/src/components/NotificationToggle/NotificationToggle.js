import React from 'react';
import { Switch, FormControlLabel, Typography, Box } from '@mui/material';
import { Notifications, NotificationsOff } from '@mui/icons-material';
import { useNotification } from '../../context/NotificationContext';
import './NotificationToggle.css';

const NotificationToggle = () => {
  const { notificationsEnabled, permission, toggleNotifications } = useNotification();

  return (
    <Box className="notification-toggle-container">
      <FormControlLabel
        control={
          <Switch
            checked={notificationsEnabled}
            onChange={toggleNotifications}
            color="primary"
          />
        }
        label={
          <Box display="flex" alignItems="center" gap={1}>
            {notificationsEnabled ? <Notifications /> : <NotificationsOff />}
            <Typography variant="body2">
              Tweet Notifications
            </Typography>
          </Box>
        }
      />
      <Typography variant="caption" color="textSecondary" className="notification-description">
        Get notified when tweets contain "cricket" or "science"
      </Typography>
      {permission === 'denied' && (
        <Typography variant="caption" color="error" className="permission-warning">
          Notifications blocked. Please enable in browser settings.
        </Typography>
      )}
    </Box>
  );
};

export default NotificationToggle;
