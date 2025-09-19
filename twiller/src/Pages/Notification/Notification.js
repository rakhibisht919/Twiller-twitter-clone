import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Avatar, Box, Chip } from '@mui/material';
import { Notifications, NotificationsActive, Favorite, Repeat, Reply, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import "../pages.css";
import './Notification.css';

const Notification = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real notifications from backend
    const fetchNotifications = async () => {
      try {
        const response = await fetch('http://localhost:5001/notifications');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        } else {
          console.log('No notifications found');
          setNotifications([]);
        }
      } catch (error) {
        console.log('Failed to fetch notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return <Favorite className="notification-icon like-icon" />;
      case 'retweet': return <Repeat className="notification-icon retweet-icon" />;
      case 'reply': return <Reply className="notification-icon reply-icon" />;
      case 'follow': return <NotificationsActive className="notification-icon follow-icon" />;
      default: return <Notifications className="notification-icon" />;
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  return (
    <div className="page">
      <div className="pageHeader" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderBottom: '1px solid rgb(239, 243, 244)',
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ArrowBack
            className="arrow-icon"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
          <div>
            <h2 className="pageTitle" style={{ margin: 0 }}>Notifications</h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgb(83, 100, 113)' }}>
              Stay updated with your latest interactions
            </p>
          </div>
        </div>
      </div>

      <div className="notifications-list">
        {loading ? (
          <Card className="loading-notifications">
            <CardContent>
              <Typography variant="body1" style={{ textAlign: 'center', padding: '20px' }}>
                Loading notifications...
              </Typography>
            </CardContent>
          </Card>
        ) : notifications.length === 0 ? (
          <Card className="empty-notifications">
            <CardContent>
              <Typography variant="h6" className="empty-title" style={{ textAlign: 'center', marginBottom: '8px' }}>
                No notifications yet
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center' }}>
                When someone interacts with your tweets, you'll see it here.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => markAsRead(notification.id)}
              style={{ marginBottom: '8px', cursor: 'pointer' }}
            >
              <CardContent className="notification-content">
                <div className="notification-icon-container">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <Avatar 
                  src={notification.user?.avatar} 
                  className="notification-avatar"
                >
                  {notification.user?.name?.charAt(0)}
                </Avatar>
                
                <Box className="notification-details">
                  <Typography variant="body1" className="notification-text">
                    <strong>{notification.user?.name}</strong> {notification.content}
                  </Typography>
                  <Typography variant="caption" className="notification-time">
                    {notification.timestamp}
                  </Typography>
                </Box>
                
                {!notification.read && (
                  <Chip 
                    label="New" 
                    size="small" 
                    className="new-badge"
                  />
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Notification;
