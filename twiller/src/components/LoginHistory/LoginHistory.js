import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import { 
  Computer, 
  Smartphone, 
  Tablet, 
  LocationOn, 
  Schedule,
  Security
} from '@mui/icons-material';
import { useUserAuth } from '../../context/UserAuthContext';
import './LoginHistory.css';

const LoginHistory = ({ limit = 10 }) => {
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useUserAuth();

  useEffect(() => {
    const fetchLoginHistory = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }
      
      try {
        // Try to fetch from server first
        const response = await fetch(`http://localhost:5001/login-history?email=${encodeURIComponent(user.email)}&limit=${limit}&successOnly=true`);
        
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
        // Fallback to localStorage
        const localHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
        const filteredHistory = localHistory
          .filter(entry => entry.loginSuccess && entry.email === user.email)
          .slice(0, limit)
          .reverse();
        setLoginHistory(filteredHistory);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoginHistory();
  }, [user?.email, limit]);

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

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <Card className="login-history-card">
        <CardContent>
          <Typography variant="h6" className="history-title">
            <Security /> Login History
          </Typography>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="login-history-card">
      <CardContent>
        <Typography variant="h6" className="history-title">
          <Security /> Login History
        </Typography>
        <Typography variant="body2" color="textSecondary" className="history-subtitle">
          Recent login activities and device information
        </Typography>
        
        {loginHistory.length === 0 ? (
          <Typography variant="body2" className="no-history">
            No login history available
          </Typography>
        ) : (
          <List className="history-list">
            {loginHistory.map((entry, index) => (
              <React.Fragment key={index}>
                <ListItem className="history-item">
                  <ListItemIcon>
                    {getDeviceIcon(entry.deviceType)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box className="history-primary">
                        <Typography variant="body1" className="device-info">
                          {entry.deviceType} - {entry.os}
                        </Typography>
                        <Chip 
                          label={entry.browser} 
                          size="small" 
                          color={getBrowserColor(entry.browser)}
                          className="browser-chip"
                        />
                      </Box>
                    }
                    secondary={
                      <Box className="history-secondary">
                        <Typography variant="caption" className="timestamp">
                          <Schedule fontSize="small" /> {formatDate(entry.timestamp)}
                        </Typography>
                        <Typography variant="caption" className="ip-address">
                          <LocationOn fontSize="small" /> IP: {entry.ipAddress}
                        </Typography>
                        <Typography variant="caption" className="timezone">
                          Timezone: {entry.timezone}
                        </Typography>
                        {entry.authMethod && (
                          <Typography variant="caption" className="auth-method">
                            Auth: {entry.authMethod.toUpperCase()}
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
  );
};

export default LoginHistory;
