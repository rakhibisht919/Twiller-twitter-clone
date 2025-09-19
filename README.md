# Twiller - Twitter Clone

A comprehensive Twitter clone built with React.js and Node.js, featuring advanced authentication, responsive design, and modern UI/UX patterns.

## Features

### Advanced Authentication System
- **Device-Based Authentication**: Different auth requirements based on browser and device
- **Chrome Browser**: Requires OTP verification via email
- **Microsoft Edge**: No additional authentication required
- **Mobile Access**: Time-restricted access (10 AM - 1 PM only)
- **Login Tracking**: Complete device, browser, OS, and IP tracking
- **Forgot Password**: Daily reset limits with secure random password generation

### Modern UI/UX
- **Dark/Light Theme**: Automatic theme detection with manual toggle
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Material-UI Components**: Modern, accessible interface
- **Smooth Animations**: CSS transitions and hover effects

### Smart Notifications
- **Browser Notifications**: Automatic notifications for tweets containing "cricket" or "science"
- **User Control**: Enable/disable notifications from profile settings
- **Real-time Updates**: Instant notification delivery

### Custom Video Player
- **Gesture Controls**: 
  - Double-tap left: -10 seconds
  - Double-tap right: +10 seconds
  - Single-tap center: Play/Pause
  - Triple-tap center: Next video
  - Triple-tap right: Close application
  - Triple-tap left: Open comments
- **Touch-Friendly**: Optimized for mobile interactions
- **Custom UI**: Beautiful, modern video player interface

### Complete Social Features
- **Tweet Posting**: Rich text tweets with media support
- **User Profiles**: Customizable profiles with bio, location, website
- **Explore Page**: Trending topics and user suggestions
- **Notifications**: Activity feed with like, retweet, reply notifications
- **Responsive Feed**: Infinite scroll with fallback data

## Tech Stack

### Frontend
- **React.js** - UI framework
- **Material-UI** - Component library
- **React Router** - Navigation
- **Context API** - State management
- **CSS Variables** - Theming system

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **CORS** - Cross-origin requests

### Authentication
- **Firebase Auth** - User authentication
- **Google OAuth** - Social login
- **Custom OTP** - Email verification

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/twiller-twitterclone.git
   cd twiller-twitterclone
   ```

2. **Install frontend dependencies**
   ```bash
   cd twiller
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` in the server directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```
   
   Create `.env` in the twiller directory:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm start
   ```

2. **Start the frontend application**
   ```bash
   cd twiller
   npm start
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

## Available Scripts

### Frontend (twiller directory)
- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner

### Backend (server directory)
- `npm start` - Starts the server with nodemon
- `npm run start-dev` - Development server with auto-reload

## Configuration

### Authentication Rules
- **Chrome users**: Must verify email via OTP
- **Edge users**: Direct login allowed
- **Mobile users**: Access restricted to 10 AM - 1 PM
- **All logins**: Tracked with device information

### Notification Settings
- Keywords: "cricket", "science"
- User can enable/disable from profile
- Browser permission required

### Theme System
- Automatic dark/light detection
- Manual toggle available
- Persistent user preference

## Deployment

### Netlify Deployment
1. Build the frontend: `npm run build`
2. Deploy the `build` folder to Netlify
3. Configure environment variables
4. Set up redirects for SPA routing

### Server Deployment
1. Deploy to Heroku, Railway, or similar
2. Set MongoDB connection string
3. Configure CORS for your domain

## Project Structure

```bash
twiller-twitterclone/
├── twiller/                 # Frontend React app
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React contexts
│   │   ├── Pages/           # Page components
│   │   ├── utils/           # Utility functions
│   │   └── hooks/           # Custom hooks
│   └── public/              # Static assets
├── server/                  # Backend Node.js app
│   ├── index.js            # Main server file
│   └── .env                # Environment variables
└── README.md               # This file
```

## Security Features

- **Input Validation**: All user inputs sanitized
- **Rate Limiting**: Password reset limitations
- **Device Tracking**: Complete login audit trail
- **Secure Authentication**: Firebase integration
- **CORS Protection**: Configured for security

## Internship Requirements Completed

**Responsive Design** - Complete mobile/tablet/desktop support  
**Forgot Password** - Daily limits + random password generation  
**Browser Notifications** - Cricket/science keyword detection  
**Custom Video Player** - Full gesture control implementation  
**Login Tracking** - Device/browser/OS/IP tracking with conditional auth  
**Dark/Light Theme** - Complete theme system  
**Functional Navigation** - All pages working with proper routing  

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Developer

**Nullclass Intern Project**  
Built with using React.js and Node.js

## Support

For support and questions, please contact your mentor or create an issue in the repository.

---

**Happy Tweeting! **
