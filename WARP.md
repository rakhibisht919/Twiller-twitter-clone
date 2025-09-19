# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Twiller is a comprehensive Twitter clone built with React.js and Node.js, featuring advanced authentication, real-time updates via Socket.IO, and modern UI/UX patterns. The project has sophisticated authentication rules based on browser type and device detection, along with custom video player controls and notification systems.

## Development Commands

### Frontend (twiller directory)
```bash
cd twiller
npm install              # Install dependencies
npm start               # Start development server (port 3000)
npm run build           # Build for production
npm test               # Run tests with Jest/React Testing Library
```

### Backend (server directory)
```bash
cd server
npm install              # Install dependencies
npm start               # Start server with nodemon (port 5001)
npm run start-dev       # Development server with auto-reload
```

### Full Stack Development
Start both frontend and backend in separate terminals:
```bash
# Terminal 1 - Backend
cd server && npm start

# Terminal 2 - Frontend  
cd twiller && npm start
```

## Architecture Overview

### Technology Stack
- **Frontend**: React 18, Material-UI, React Router, Firebase Auth, Socket.IO Client
- **Backend**: Node.js, Express, MongoDB, Socket.IO, Nodemailer
- **Authentication**: Firebase Auth with custom OTP system
- **Database**: MongoDB with in-memory fallback
- **Real-time**: Socket.IO for live updates
- **Deployment**: Netlify (frontend), configurable backend

### Project Structure
```
twiller-twitterclone/
├── twiller/              # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── Pages/        # Route-based page components
│   │   ├── context/      # React Context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Utility functions
│   │   └── config/       # Configuration files
│   └── public/           # Static assets
├── server/               # Node.js backend
│   ├── index.js         # Main server file with all API endpoints
│   ├── server/utils/    # Server utilities
│   └── utils/           # Additional utilities
└── README.md            # Project documentation
```

### Core Context Architecture
The application uses a hierarchical context structure:
- **ThemeProvider**: Auto-detects dark/light mode, persists user preference
- **NotificationProvider**: Manages browser notifications for cricket/science keywords
- **BookmarkProvider**: Handles bookmark functionality
- **UserAuthContextProvider**: Firebase authentication with custom OTP flows
- **SocketProvider**: Real-time communication for live tweet updates

### Authentication System
Complex authentication rules based on device/browser detection:
- **Chrome users**: Require OTP email verification
- **Microsoft Edge users**: Direct login allowed
- **Mobile users**: Time-restricted access (10 AM - 1 PM only)
- **All logins**: Tracked with device, browser, OS, and IP information

### Database Architecture
- **Primary**: MongoDB with collections for posts, users, follows
- **Fallback**: In-memory data store when MongoDB unavailable
- **Real-time updates**: Socket.IO broadcasts for likes, reshares, new tweets
- **Data validation**: Username minimum 3 characters, proper error handling

### API Endpoints Structure
Key endpoints in server/index.js:
- `PATCH /userupdate` - Update user profile with validation
- `POST /post` - Create new tweet with real-time broadcast
- `GET /posts` - Fetch all tweets with interaction data
- `POST /post/like` - Toggle like with real-time updates
- `POST /post/reshare` - Toggle reshare with real-time updates
- `GET /post` - Fetch tweets (optionally filtered by user)
- `GET /loggedinuser` - Fetch user data by email

### Real-time Features
Socket.IO events:
- `new-tweet`: Broadcasts when tweets are posted
- `post-liked`: Updates like counts in real-time
- `post-reshared`: Updates reshare counts in real-time

## Environment Configuration

### Frontend (.env in twiller/)
```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
```

### Backend (.env in server/)
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5001
```

## Testing

### Frontend Testing
- Uses React Testing Library and Jest
- Test files: `src/App.test.js`, `src/setupTests.js`
- Run with: `npm test` (in twiller directory)

### Manual Testing Focus Areas
1. **Authentication flows**: Test different browsers and time restrictions
2. **Real-time updates**: Verify Socket.IO functionality across multiple clients
3. **Theme switching**: Test auto-detection and manual toggle
4. **Video player gestures**: Test all tap combinations and controls
5. **Notification system**: Test keyword detection and permission handling

## Deployment

### Frontend (Netlify)
- Configuration in `netlify.toml`
- Build command: `npm run build`
- Publish directory: `build`
- SPA redirects configured
- Security headers implemented

### Backend Deployment
- Environment variables required for MongoDB
- CORS configured for cross-origin requests
- Fallback system ensures functionality without database

## Development Guidelines

### Code Architecture Patterns
1. **Context-based state management**: All global state through React Context
2. **Component composition**: Reusable components in components/ directory
3. **Page-based routing**: Each route corresponds to Pages/ directory structure
4. **Custom hooks**: Business logic extracted to hooks/ directory
5. **Error handling**: Comprehensive try-catch with fallback data

### Key Development Considerations
1. **Socket connection management**: Always handled in SocketContext
2. **Theme persistence**: Automatic localStorage management
3. **Authentication state**: Global user state with loading states
4. **Real-time data sync**: All mutations broadcast via Socket.IO
5. **Mobile responsiveness**: Gesture controls and responsive design throughout

### Database Fallback System
The server implements automatic fallback to in-memory storage if MongoDB is unavailable, ensuring the application remains functional during development or deployment issues.

### Special Features Implementation
- **Custom video player**: Complex gesture detection system
- **Smart notifications**: Keyword-based browser notification system
- **Device-aware auth**: Browser and device detection for conditional authentication
- **Theme auto-detection**: System preference detection with manual override
- **Real-time social features**: Live updates for all social interactions