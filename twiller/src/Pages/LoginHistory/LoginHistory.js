import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Chip,
  Box,
  Divider,
  CircularProgress,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Grid,
  Paper,
  Button
} from '@mui/material';
import { 
  Computer, 
  Smartphone, 
  Tablet, 
  LocationOn, 
  Schedule,
  Security,
  ArrowBack,
  CheckCircle,
  Error,
  Warning,
  Refresh
} from '@mui/icons-material';
import { useUserAuth } from '../../context/UserAuthContext';
import './LoginHistory.css';

const LoginHistory = () => {
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFailures, setShowFailures] = useState(false);
  const { user } = useUserAuth();
  const navigate = useNavigate();

  const fetchLoginHistory = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Try to fetch from server first
      const response = await fetch(`http://localhost:5001/login-history?email=${encodeURIComponent(user.email)}&limit=50&successOnly=${!showFailures}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLoginHistory(data.history);
        } else {
          throw new Error(data.error || 'Failed to fetch login history');
        }
      } else {
        throw new Error('Server response not ok');
      }
    } catch (serverError) {
      console.log('Server unavailable, using local storage:', serverError);
      setError('Could not connect to server. Showing local data only.');
      
      // Fallback to localStorage
      const localHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
      let filteredHistory = localHistory.filter(entry => entry.email === user.email);
      
      if (!showFailures) {
        filteredHistory = filteredHistory.filter(entry => entry.loginSuccess);
      }
      
      filteredHistory = filteredHistory.slice(0, 50).reverse();
      setLoginHistory(filteredHistory);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoginHistory();
  }, [user?.email, showFailures]);

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'Mobile': return <Smartphone />;
      case 'Tablet': return <Tablet />;
      default: return <Computer />;
    }
  };

  const getBrowserColor = (browser) => {
    switch (browser) {
      case 'Chrome': return 'primary';
      case 'Edge': return 'secondary';
      case 'Firefox': return 'warning';
      case 'Safari': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (loginSuccess, authMethod) => {
    if (loginSuccess) {
      return authMethod === 'otp' ? 
        <CheckCircle style={{ color: '#4caf50', fontSize: 16 }} /> : 
        <CheckCircle style={{ color: '#4caf50', fontSize: 16 }} />;
    } else {
      return <Error style={{ color: '#f44336', fontSize: 16 }} />;
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStats = () => {
    const totalLogins = loginHistory.length;
    const successfulLogins = loginHistory.filter(entry => entry.loginSuccess).length;
    const failedLogins = totalLogins - successfulLogins;
    const otpLogins = loginHistory.filter(entry => entry.authMethod === 'otp').length;
    
    const browsers = {};
    const devices = {};
    
    loginHistory.forEach(entry => {
      browsers[entry.browser] = (browsers[entry.browser] || 0) + 1;
      devices[entry.deviceType] = (devices[entry.deviceType] || 0) + 1;
    });
    
    return { totalLogins, successfulLogins, failedLogins, otpLogins, browsers, devices };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="login-history-page">
        <div className="page-header">
          <IconButton onClick={() => navigate(-1)} className="back-btn">
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" className="page-title">
            Login History
          </Typography>
        </div>
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      </div>
    );
  }

  return (
    <div className="login-history-page">
      <div className="page-header">
        <IconButton onClick={() => navigate(-1)} className="back-btn">
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" className="page-title">
          Login History
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchLoginHistory}
          className="refresh-btn"
        >
          Refresh
        </Button>
      </div>

      {error && (
        <Alert severity="warning" className="error-alert">
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} className="stats-grid">
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="stat-card">
            <Box className="stat-content">
              <CheckCircle className="stat-icon success" />
              <div>
                <Typography variant="h4">{stats.successfulLogins}</Typography>
                <Typography variant="body2" color="textSecondary">Successful Logins</Typography>
              </div>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="stat-card">
            <Box className="stat-content">
              <Error className="stat-icon error" />
              <div>
                <Typography variant="h4">{stats.failedLogins}</Typography>
                <Typography variant="body2" color="textSecondary">Failed Attempts</Typography>
              </div>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="stat-card">
            <Box className="stat-content">
              <Security className="stat-icon warning" />
              <div>
                <Typography variant="h4">{stats.otpLogins}</Typography>
                <Typography variant="body2" color="textSecondary">OTP Logins</Typography>
              </div>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="stat-card">
            <Box className="stat-content">
              <Computer className="stat-icon info" />
              <div>
                <Typography variant="h4">{Object.keys(stats.devices).length}</Typography>
                <Typography variant="body2" color="textSecondary">Device Types</Typography>
              </div>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Controls */}
      <Card className="controls-card">
        <CardContent>
          <FormControlLabel
            control={
              <Switch 
                checked={showFailures}
                onChange={(e) => setShowFailures(e.target.checked)}
                color="primary"
              />
            }
            label="Show failed login attempts"
          />
        </CardContent>
      </Card>

      {/* Login History List */}
      <Card className="login-history-card">
        <CardContent>
          <Typography variant="h6" className="history-title">
            <Security /> Login Activity
          </Typography>
          <Typography variant="body2" color="textSecondary" className="history-subtitle">
            Recent login activities and device information ({loginHistory.length} entries)
          </Typography>
          
          {loginHistory.length === 0 ? (
            <Box className="no-history">
              <Warning className="no-history-icon" />
              <Typography variant="body1">
                No login history available
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Your login activities will appear here
              </Typography>
            </Box>
          ) : (
            <List className="history-list">
              {loginHistory.map((entry, index) => (
                <React.Fragment key={index}>
                  <ListItem className={`history-item ${entry.loginSuccess ? 'success' : 'failed'}`}>
                    <ListItemIcon>
                      {getDeviceIcon(entry.deviceType)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box className="history-primary">
                          <div className="device-info-row">
                            <Typography variant="body1" className="device-info">
                              {entry.deviceType} - {entry.os}
                            </Typography>
                            <div className="status-badges">
                              {getStatusIcon(entry.loginSuccess, entry.authMethod)}
                              <Chip 
                                label={entry.browser} 
                                size="small" 
                                color={getBrowserColor(entry.browser)}
                                className="browser-chip"
                              />
                              {entry.authMethod && (
                                <Chip 
                                  label={entry.authMethod.toUpperCase()} 
                                  size="small" 
                                  variant="outlined"
                                  className="auth-chip"
                                />
                              )}
                            </div>
                          </div>
                        </Box>
                      }
                      secondary={
                        <Box className="history-secondary">
                          <Typography variant="caption" className="timestamp">
                            <Schedule fontSize="small" /> {formatDate(entry.timestamp)}
                          </Typography>
                          <Typography variant="caption" className="ip-address">
                            <LocationOn fontSize="small" /> IP: {entry.ipAddress || 'Unknown'}
                          </Typography>
                          {entry.timezone && (
                            <Typography variant="caption" className="timezone">
                              Timezone: {entry.timezone}
                            </Typography>
                          )}
                          {!entry.loginSuccess && entry.failureReason && (
                            <Typography variant="caption" className="failure-reason" color="error">
                              Reason: {entry.failureReason}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < loginHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert severity="info" className="security-notice">
        <Typography variant="body2">
          <strong>Security Notice:</strong> If you notice any suspicious activity or unrecognized logins, 
          please change your password immediately and enable two-factor authentication.
        </Typography>
      </Alert>
    </div>
  );
};

export default LoginHistory;