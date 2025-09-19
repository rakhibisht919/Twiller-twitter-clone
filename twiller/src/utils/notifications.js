/**
 * Utility functions for showing toast notifications
 */

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds (default: 4000)
 */
export const showNotification = (message, type = 'info', duration = 4000) => {
  const notification = document.createElement('div');
  
  // Define colors for different notification types
  const colors = {
    success: '#4CAF50',
    error: '#f44336',
    warning: '#FF9800',
    info: '#2196F3'
  };

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    z-index: 10000;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 400px;
    word-wrap: break-word;
    animation: slideIn 0.3s ease-out;
  `;

  // Add CSS animation keyframes
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  notification.textContent = message;
  document.body.appendChild(notification);

  // Remove notification after specified duration
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, duration);

  return notification;
};

/**
 * Show success notification
 * @param {string} message - Success message
 * @param {number} duration - Duration in milliseconds
 */
export const showSuccess = (message, duration = 3000) => {
  return showNotification(message, 'success', duration);
};

/**
 * Show error notification
 * @param {string} message - Error message
 * @param {number} duration - Duration in milliseconds
 */
export const showError = (message, duration = 5000) => {
  return showNotification(message, 'error', duration);
};

/**
 * Show warning notification
 * @param {string} message - Warning message
 * @param {number} duration - Duration in milliseconds
 */
export const showWarning = (message, duration = 4000) => {
  return showNotification(message, 'warning', duration);
};

/**
 * Show info notification
 * @param {string} message - Info message
 * @param {number} duration - Duration in milliseconds
 */
export const showInfo = (message, duration = 4000) => {
  return showNotification(message, 'info', duration);
};

/**
 * Show loading notification that persists until manually closed
 * @param {string} message - Loading message
 * @returns {Function} - Function to close the notification
 */
export const showLoading = (message) => {
  const notification = showNotification(message, 'info', 999999);
  
  // Add spinner
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top: 2px solid white;
    animation: spin 1s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  `;
  
  if (!document.getElementById('spinner-styles')) {
    const style = document.createElement('style');
    style.id = 'spinner-styles';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  notification.insertBefore(spinner, notification.firstChild);
  
  return () => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  };
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = () => {
  const notifications = document.querySelectorAll('[style*="position: fixed"][style*="top: 20px"][style*="right: 20px"]');
  notifications.forEach(notification => {
    notification.remove();
  });
};