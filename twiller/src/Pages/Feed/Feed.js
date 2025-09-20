import React, { useEffect, useState } from "react";
import "./Feed.css";
import Posts from "./Posts/Posts";
import Tweetbox from "./Tweetbox/Tweetbox";
import API_BASE_URL from "../../config/api";
import { useNotification } from "../../context/NotificationContext";
import { useUserAuth } from "../../context/UserAuthContext";
import { useSocket } from "../../context/SocketContext";

const Feed = () => {
  const [post, setpost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();
  const { user } = useUserAuth();
  const socket = useSocket();

  // Fetch posts from deployed backend
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/posts`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setpost(data);
      
      // Check for new tweets and show notifications
      data.forEach(tweet => {
        showNotification(tweet);
      });
    } catch (err) {
      console.error("Failed to fetch posts:", err.message);
      setpost([]);
      setError("Unable to load posts. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]); // Re-fetch when user changes
  
  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;
    
    // Listen for new tweets
    socket.on('new-tweet', (newTweet) => {
      setpost(prevPosts => [newTweet, ...prevPosts]);
      showNotification(newTweet);
    });
    
    // Listen for likes
    socket.on('post-liked', (updatedPost) => {
      setpost(prevPosts => 
        prevPosts.map(post => 
          post._id === updatedPost._id ? updatedPost : post
        )
      );
    });
    
    // Listen for reshares
    socket.on('post-reshared', (updatedPost) => {
      setpost(prevPosts => 
        prevPosts.map(post => 
          post._id === updatedPost._id ? updatedPost : post
        )
      );
    });
    
    return () => {
      socket.off('new-tweet');
      socket.off('post-liked');
      socket.off('post-reshared');
    };
  }, [socket, showNotification]);

  return (
    <div className="feed">
      <div className="feed__header">
        <h2>Home</h2>
      </div>
      <Tweetbox />
      
      {loading && (
        <div className="loading-message">
          <p>Loading posts...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#1d9bf0',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}
      
      {!loading && !error && post.length === 0 && (
        <div className="empty-state">
          <p>No posts yet. Be the first to tweet!</p>
        </div>
      )}
      
      {post.map((p) => (
        <Posts key={p._id} p={p} />
      ))}
    </div>
  );
};

export default Feed;
