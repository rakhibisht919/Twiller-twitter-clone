import React, { createContext, useContext, useState, useEffect } from 'react';

const BookmarkContext = createContext();

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

export const BookmarkProvider = ({ children }) => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);

  // Load bookmarks from localStorage on component mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('twiller_bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarkedPosts(JSON.parse(savedBookmarks));
      } catch (error) {
        console.error('Error loading bookmarks:', error);
        setBookmarkedPosts([]);
      }
    }
  }, []);

  // Save bookmarks to localStorage whenever bookmarkedPosts changes
  useEffect(() => {
    localStorage.setItem('twiller_bookmarks', JSON.stringify(bookmarkedPosts));
  }, [bookmarkedPosts]);

  const addBookmark = (post) => {
    const postWithId = {
      ...post,
      bookmarkId: `${post.username}_${Date.now()}`,
      bookmarkedAt: new Date().toISOString()
    };
    
    setBookmarkedPosts(prev => {
      // Check if post is already bookmarked
      const isAlreadyBookmarked = prev.some(
        bookmarkedPost => bookmarkedPost.post === post.post && 
        bookmarkedPost.username === post.username
      );
      
      if (isAlreadyBookmarked) {
        return prev;
      }
      
      return [postWithId, ...prev];
    });
  };

  const removeBookmark = (post) => {
    setBookmarkedPosts(prev => 
      prev.filter(bookmarkedPost => 
        !(bookmarkedPost.post === post.post && bookmarkedPost.username === post.username)
      )
    );
  };

  const isBookmarked = (post) => {
    return bookmarkedPosts.some(
      bookmarkedPost => bookmarkedPost.post === post.post && 
      bookmarkedPost.username === post.username
    );
  };

  const toggleBookmark = (post) => {
    if (isBookmarked(post)) {
      removeBookmark(post);
      return false;
    } else {
      addBookmark(post);
      return true;
    }
  };

  const clearAllBookmarks = () => {
    setBookmarkedPosts([]);
  };

  const value = {
    bookmarkedPosts,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
    clearAllBookmarks,
    bookmarkCount: bookmarkedPosts.length
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};
