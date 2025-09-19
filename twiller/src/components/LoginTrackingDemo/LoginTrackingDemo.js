import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Alert,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Security,
  Computer,
  Smartphone,
  Schedule,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';
import { getDeviceInfo, getAuthRequirements, isMobileAccessAllowed } from '../../utils/deviceDetection';
import { useUserAuth } from '../../context/UserAuthContext';

const LoginTrackingDemo = () => {
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [authRequirements, setAuthRequirements] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');
  const { user } = useUserAuth();

  useEffect(() => {
    const initializeDemo = async () => {
      // Get device information
      const info = getDeviceInfo();
      const ipAddress = await info.getIPAddress();
      const fullDeviceInfo = { ...info, ipAddress };
      
      setDeviceInfo(fullDeviceInfo);
      
      // Check auth requirements
      const requirements = getAuthRequirements(fullDeviceInfo);
      setAuthRequirements(requirements);

      // Test server connectivity
      try {
        const response = await fetch('http://localhost:5001/check-device-access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deviceInfo: fullDeviceInfo })
        });
        
        if (response.ok) {
          setServerStatus('connected');
        } else {
          setServerStatus('disconnected');
        }
      } catch (error) {
        setServerStatus('disconnected');
      }
    };

    initializeDemo();
  }, []);

  const testLoginTracking = async () => {
    if (!deviceInfo || !user?.email) return;

    try {
      const response = await fetch('http://localhost:5001/track-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          deviceInfo: deviceInfo,
          loginSuccess: true,
          authMethod: 'demo'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Login tracked successfully!');
      }
    } catch (error) {
      console.error('Failed to track demo login:', error);
      alert('Failed to track login - server may be offline');
    }
  };

  const testOTPSend = async () => {
    if (!deviceInfo || !user?.email) return;

    try {
      const response = await fetch('http://localhost:5001/send-login-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          deviceInfo: deviceInfo
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`OTP Demo: ${data.message}${data.otp ? ' OTP: ' + data.otp : ''}`);
      }
    } catch (error) {
      console.error('Failed to send demo OTP:', error);
      alert('Failed to send OTP - server may be offline');
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'Mobile': return <Smartphone />;
      default: return <Computer />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'success';
      case 'disconnected': return 'error';
      default: return 'warning';
    }
  };

  if (!deviceInfo) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Loading device information...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Security color="primary" />
        Login Tracking System Demo
      </Typography>

      {/* Server Status */}
      <Alert 
        severity={getStatusColor(serverStatus)} 
        sx={{ mb: 3 }}
        icon={serverStatus === 'connected' ? <CheckCircle /> : <Warning />}
      >
        Server Status: {serverStatus === 'connected' ? 'Connected to backend' : 'Using fallback mode'}
      </Alert>

      {/* Device Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getDeviceIcon(deviceInfo.deviceType)}
            Current Device Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">Device Type</Typography>
                <Typography variant="body1">{deviceInfo.deviceType}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">Browser</Typography>
                <Typography variant="body1">{deviceInfo.browser}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">Operating System</Typography>
                <Typography variant="body1">{deviceInfo.os}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">IP Address</Typography>
                <Typography variant="body1">{deviceInfo.ipAddress}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Authentication Rules */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security color="primary" />
            Authentication Rules
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <Info color={authRequirements.requiresOTP ? 'warning' : 'success'} />
              </ListItemIcon>
              <ListItemText 
                primary="Chrome Browser OTP Requirement"
                secondary={
                  deviceInfo.browser === 'Chrome' 
                    ? "✓ Chrome detected - OTP required for login" 
                    : `Current browser: ${deviceInfo.browser} - No OTP required`
                }
              />
              {authRequirements.requiresOTP && (
                <Chip label="OTP Required" color="warning" size="small" />
              )}
            </ListItem>
            
            <Divider />
            
            <ListItem>
              <ListItemIcon>
                <Info color={deviceInfo.browser === 'Edge' ? 'success' : 'default'} />
              </ListItemIcon>
              <ListItemText 
                primary="Edge Browser Access"
                secondary={
                  deviceInfo.browser === 'Edge' 
                    ? "✓ Edge detected - Direct access allowed" 
                    : "Not using Edge browser"
                }
              />
              {deviceInfo.browser === 'Edge' && (
                <Chip label="Direct Access" color="success" size="small" />
              )}
            </ListItem>
            
            <Divider />
            
            <ListItem>
              <ListItemIcon>
                <Schedule color={
                  deviceInfo.deviceType === 'Mobile' 
                    ? (isMobileAccessAllowed() ? 'success' : 'error')
                    : 'default'
                } />
              </ListItemIcon>
              <ListItemText 
                primary="Mobile Time Restriction"
                secondary={
                  deviceInfo.deviceType === 'Mobile'
                    ? `Mobile device detected - Access ${isMobileAccessAllowed() ? 'allowed' : 'blocked'} (10 AM - 1 PM only)`
                    : "Not a mobile device - No time restrictions"
                }
              />
              {deviceInfo.deviceType === 'Mobile' && (
                <Chip 
                  label={isMobileAccessAllowed() ? 'Access Allowed' : 'Access Blocked'} 
                  color={isMobileAccessAllowed() ? 'success' : 'error'} 
                  size="small" 
                />
              )}
            </ListItem>
          </List>
          
          <Alert 
            severity={authRequirements.allowAccess ? 'success' : 'error'} 
            sx={{ mt: 2 }}
          >
            <Typography variant="body2">
              <strong>Current Status:</strong> {authRequirements.reason}
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Demo Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Demo Actions
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={testLoginTracking}
              disabled={!user}
            >
              Test Login Tracking
            </Button>
            
            <Button 
              variant="contained" 
              color="secondary"
              onClick={testOTPSend}
              disabled={!user || deviceInfo.browser !== 'Chrome'}
            >
              Test OTP Send (Chrome Only)
            </Button>
            
            <Button 
              variant="outlined"
              onClick={() => window.open('/login-history', '_blank')}
              disabled={!user}
            >
              View Login History
            </Button>
          </Box>
          
          {!user && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Please log in to test the login tracking features.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginTrackingDemo;