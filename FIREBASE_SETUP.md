# 🔥 Firebase Setup Instructions

If you want full authentication features, follow these steps to set up Firebase:

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `twiller-clone`
4. Continue through setup wizard

## Step 2: Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get Started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Enable "Google" (optional)

## Step 3: Register Web App

1. In Firebase Console, click the web icon `</>`
2. Register app name: `twiller-web`
3. Copy the Firebase configuration object

## Step 4: Update Environment Variables

Add these to your `.env` file in the `twiller` directory:

```env
# Existing API config
REACT_APP_API_URL=http://192.168.29.125:5001
HOST=0.0.0.0
PORT=3000

# Add Firebase config (replace with your values)
REACT_APP_FIREBASE_API_KEY=AIzaSyB...your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=twiller-clone.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=twiller-clone
REACT_APP_FIREBASE_STORAGE_BUCKET=twiller-clone.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Step 5: Restart Development Server

After adding the environment variables:

```bash
# Stop current server
# Then restart
npm start
```

## Features Enabled with Firebase

✅ **Google OAuth Login**
✅ **Email/Password Registration** 
✅ **Password Reset**
✅ **Secure User Sessions**
✅ **Account Deletion**
✅ **Authentication State Management**

## Without Firebase (Current Mock Mode)

⚠️ **Mock Authentication** - Login works but data isn't persisted
⚠️ **No Password Reset** - Feature is disabled
⚠️ **No Google Login** - Uses mock Google authentication
⚠️ **Sessions Don't Persist** - User logged out on refresh

## Testing Without Firebase

Your app will work fine for mobile testing without Firebase, but authentication will be simulated.