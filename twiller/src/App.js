import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login/Login";
import Signup from "./Pages/Login/Signup";
import ForgotPassword from "./Pages/Login/ForgotPassword";
import ResetPassword from "./Pages/Login/ResetPassword";
import EmailVerification from "./Pages/Login/EmailVerification";
import Feed from "./Pages/Feed/Feed";
import Explore from "./Pages/Explore/Explore";
import Notification from "./Pages/Notification/Notification";
import Message from "./Pages/Messages/Message";
import ProtectedRoute from "./Pages/ProtectedRoute";
import Lists from "./Pages/Lists/Lists";
import Profile from "./Pages/Profile/Profile";
import UserProfile from "./Pages/UserProfile/UserProfile";
import More from "./Pages/more/More";
import Settings from "./Pages/Settings/Settings";
import Topics from "./Pages/Topics/Topics";
import Terms from "./Pages/Terms/Terms";
import { UserAuthContextProvider } from "./context/UserAuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { BookmarkProvider } from "./context/BookmarkContext";
import { SocketProvider } from "./context/SocketContext";
import Bookmark from "./Pages/Bookmark/Bookmark";
import Debug from "./Pages/Debug/Debug";

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <BookmarkProvider>
          <UserAuthContextProvider>
            <SocketProvider>
              <div className="app">
              <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Feed />} />
                <Route path="feed" element={<Feed />} />
                <Route path="explore" element={<Explore />} />
                <Route path="notification" element={<Notification />} />
                <Route path="messages" element={<Message />} />
                <Route path="lists" element={<Lists />} />
                <Route path="bookmarks" element={<Bookmark />} />
                <Route path="profile" element={<Profile />} />
                <Route path="user/:username" element={<UserProfile />} />
                <Route path="more" element={<More />} />
                <Route path="settings" element={<Settings />} />
                <Route path="settings/*" element={<Settings />} />
                <Route path="topics" element={<Topics />} />
                <Route path="terms" element={<Terms />} />
                <Route path="debug" element={<Debug />} />
              </Route>
            </Routes>
              </div>
            </SocketProvider>
          </UserAuthContextProvider>
        </BookmarkProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
