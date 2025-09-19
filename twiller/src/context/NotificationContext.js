import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('twiller-notifications-enabled');
    return saved ? JSON.parse(saved) : false;
  });

  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    localStorage.setItem('twiller-notifications-enabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  };

  const checkTweetForKeywords = (tweetText) => {
    const keywords = ['cricket', 'science'];
    const lowerText = tweetText.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword));
  };

  const showNotification = (tweet) => {
    if (!notificationsEnabled || permission !== 'granted') return;

    if (checkTweetForKeywords(tweet.post)) {
      const notification = new Notification('Twiller - Interesting Tweet!', {
        body: tweet.post,
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: `tweet-${tweet._id}`,
        requireInteraction: true,
        data: {
          tweetId: tweet._id,
          username: tweet.username || tweet.name
        }
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestPermission();
      if (granted) {
        setNotificationsEnabled(true);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const value = {
    notificationsEnabled,
    permission,
    requestPermission,
    showNotification,
    toggleNotifications,
    checkTweetForKeywords
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
