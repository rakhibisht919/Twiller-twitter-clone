// API configuration
// Use environment variable for flexibility, fallback to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// For mobile testing, you can also use the network IP directly
// const API_BASE_URL = 'http://192.168.29.125:5001';

export default API_BASE_URL;
