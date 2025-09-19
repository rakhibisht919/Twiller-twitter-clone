// Device and browser detection utilities
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  
  // Browser detection
  const getBrowser = () => {
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  };

  // OS detection
  const getOS = () => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  };

  // Device type detection
  const getDeviceType = () => {
    if (/Mobi|Android/i.test(userAgent)) return 'Mobile';
    if (/Tablet|iPad/i.test(userAgent)) return 'Tablet';
    return 'Desktop';
  };

  // Get IP address (using a public API)
  const getIPAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Failed to get IP address:', error);
      return 'Unknown';
    }
  };

  return {
    browser: getBrowser(),
    os: getOS(),
    deviceType: getDeviceType(),
    userAgent,
    getIPAddress,
    timestamp: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth
    }
  };
};

// Check if current time is within allowed mobile access hours (10 AM - 1 PM)
export const isMobileAccessAllowed = () => {
  const now = new Date();
  const hours = now.getHours();
  return hours >= 10 && hours < 13; // 10 AM to 1 PM
};

// Authentication rules based on device/browser
export const getAuthRequirements = (deviceInfo) => {
  const requirements = {
    requiresOTP: false,
    allowAccess: true,
    reason: ''
  };

  // Chrome requires OTP
  if (deviceInfo.browser === 'Chrome') {
    requirements.requiresOTP = true;
    requirements.reason = 'Chrome browser requires OTP verification';
  }

  // Edge allows without additional authentication
  if (deviceInfo.browser === 'Edge') {
    requirements.requiresOTP = false;
    requirements.reason = 'Edge browser - no additional authentication required';
  }

  // Mobile access time restriction
  if (deviceInfo.deviceType === 'Mobile' && !isMobileAccessAllowed()) {
    requirements.allowAccess = false;
    requirements.reason = 'Mobile access is only allowed between 10 AM - 1 PM';
  }

  return requirements;
};
