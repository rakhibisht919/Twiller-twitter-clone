// API configuration
// Use environment variable for flexibility, fallback to deployed backend
// Deployed: 2025-01-20 20:35 - Backend fully deployed to Render
// Force rebuild: 2025-01-20 22:03 - Fixed Netlify environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://twiller-twitter-clone-0y03.onrender.com';

// Fallback to localhost for development
// const API_BASE_URL = 'http://localhost:5001';

export default API_BASE_URL;
