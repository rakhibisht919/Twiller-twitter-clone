import React, { useState, useEffect } from "react";
import "./Posts.css";
import { Avatar, IconButton, Dialog, DialogContent, DialogTitle, TextField, Button, CircularProgress } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../../../context/UserAuthContext";
import useLoggedinuser from "../../../hooks/useLoggedinuser";
import { useSocket } from "../../../context/SocketContext";

const Posts = ({ p, isProfileView = false }) => {
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const [loggedinuser] = useLoggedinuser();
  const socket = useSocket();
  const { name, username, photo, post, profilephoto, _id } = p;
  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(p.likes || 0);
  const [retweetCount, setRetweetCount] = useState(p.reshares || 0);
  const [replyCount, setReplyCount] = useState(p.comments || 0);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  
  const currentUserId = user?.email || user?.uid;
  const currentUsername = loggedinuser[0]?.username || user?.email?.split('@')[0];
  
  // Update counts when props change and check user interaction status
  useEffect(() => {
    setLikeCount(p.likes || 0);
    setRetweetCount(p.reshares || 0);
    setReplyCount(p.comments || 0);
    
    // Check if current user has liked, retweeted, or bookmarked this post
    if (currentUserId && p._id) {
      setLiked(p.likedBy?.includes(currentUserId) || false);
      setRetweeted(p.resharedBy?.includes(currentUserId) || false);
      
      // Check bookmark status from localStorage
      const bookmarks = JSON.parse(localStorage.getItem(`bookmarks_${currentUserId}`) || '[]');
      setBookmarked(bookmarks.includes(p._id));
    }
  }, [p.likes, p.reshares, p.comments, p.likedBy, p.resharedBy, currentUserId, p._id]);

  // Socket.IO listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handlePostLiked = (updatedPost) => {
      if (updatedPost._id === p._id) {
        setLikeCount(updatedPost.likes || 0);
        setLiked(updatedPost.likedBy?.includes(currentUserId) || false);
      }
    };

    const handlePostReshared = (updatedPost) => {
      if (updatedPost._id === p._id) {
        setRetweetCount(updatedPost.reshares || 0);
        setRetweeted(updatedPost.resharedBy?.includes(currentUserId) || false);
      }
    };

    const handlePostCommented = (updatedPost) => {
      if (updatedPost._id === p._id) {
        setReplyCount(updatedPost.comments || 0);
      }
    };

    socket.on('post-liked', handlePostLiked);
    socket.on('post-reshared', handlePostReshared);
    socket.on('post-commented', handlePostCommented);

    return () => {
      socket.off('post-liked', handlePostLiked);
      socket.off('post-reshared', handlePostReshared);
      socket.off('post-commented', handlePostCommented);
    };
  }, [socket, p._id, currentUserId]);

  const handleLike = async (e) => {
    e.stopPropagation();
    
    try {
      // Optimistic UI update
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
      
      // Send to server
      const response = await fetch('http://localhost:5001/post/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: _id,
          userId: currentUserId,
          username: currentUsername,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to like post');
      }
      
      // Server will emit socket event to update all clients
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert optimistic update on error
      setLiked(!liked);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
    }
  };

  const handleRetweet = async (e) => {
    e.stopPropagation();
    
    try {
      // Optimistic UI update
      setRetweeted(!retweeted);
      setRetweetCount(prev => retweeted ? prev - 1 : prev + 1);
      
      // Send to server
      const response = await fetch('http://localhost:5001/post/reshare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: _id,
          userId: currentUserId,
          username: currentUsername,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reshare post');
      }
      
      // Server will emit socket event to update all clients
    } catch (error) {
      console.error('Error resharing post:', error);
      // Revert optimistic update on error
      setRetweeted(!retweeted);
      setRetweetCount(prev => retweeted ? prev + 1 : prev - 1);
    }
  };

  const handleReply = (e) => {
    e.stopPropagation();
    setShowCommentModal(true);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      const response = await fetch('http://localhost:5001/post/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: _id,
          userId: currentUserId,
          username: currentUsername,
          comment: commentText.trim(),
          commenterName: name,
        }),
      });

      if (response.ok) {
        setCommentText('');
        setShowCommentModal(false);
        // The socket listener will handle updating the comment count
      } else {
        throw new Error('Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `Tweet by ${name}`,
        text: post,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    
    if (!currentUserId) return;
    
    try {
      const newBookmarkedState = !bookmarked;
      setBookmarked(newBookmarkedState);
      
      // Update localStorage bookmarks
      const bookmarks = JSON.parse(localStorage.getItem(`bookmarks_${currentUserId}`) || '[]');
      
      if (newBookmarkedState) {
        // Add bookmark
        if (!bookmarks.includes(_id)) {
          bookmarks.push(_id);
          localStorage.setItem(`bookmarks_${currentUserId}`, JSON.stringify(bookmarks));
          
          // Also store the full post data for the bookmarks page
          const bookmarkedPosts = JSON.parse(localStorage.getItem(`bookmarked_posts_${currentUserId}`) || '[]');
          const postExists = bookmarkedPosts.find(post => post._id === _id);
          if (!postExists) {
            bookmarkedPosts.push(p);
            localStorage.setItem(`bookmarked_posts_${currentUserId}`, JSON.stringify(bookmarkedPosts));
          }
        }
      } else {
        // Remove bookmark
        const updatedBookmarks = bookmarks.filter(id => id !== _id);
        localStorage.setItem(`bookmarks_${currentUserId}`, JSON.stringify(updatedBookmarks));
        
        // Remove from bookmarked posts
        const bookmarkedPosts = JSON.parse(localStorage.getItem(`bookmarked_posts_${currentUserId}`) || '[]');
        const updatedBookmarkedPosts = bookmarkedPosts.filter(post => post._id !== _id);
        localStorage.setItem(`bookmarked_posts_${currentUserId}`, JSON.stringify(updatedBookmarkedPosts));
      }
      
      // Optionally send to server for persistence
      try {
        await fetch('http://localhost:5001/post/bookmark', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postId: _id,
            userId: currentUserId,
            bookmarked: newBookmarkedState,
          }),
        });
      } catch (serverError) {
        console.log('Bookmark saved locally (server not available)');
      }
    } catch (error) {
      console.error('Error bookmarking post:', error);
      // Revert on error
      setBookmarked(bookmarked);
    }
  };

  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  const navigateToProfile = (e) => {
    e.stopPropagation();
    navigate(`/user/${username}`);
  };

  return (
    <>
    <div className={`post ${isProfileView ? 'post--profile' : ''}`} onClick={() => console.log('Post clicked')}>
      <div className="post__avatar" onClick={navigateToProfile} style={{ cursor: 'pointer' }}>
        <Avatar src={profilephoto} sx={{ width: 40, height: 40 }} />
      </div>
      <div className="post__body">
        <div className="post__header">
          <div className="post__headerText">
            <span className="post__name" onClick={navigateToProfile} style={{ cursor: 'pointer' }}>{name}</span>
            <VerifiedUserIcon className="post__badge" />
            <span className="post__username" onClick={navigateToProfile} style={{ cursor: 'pointer' }}>@{username}</span>
            <span className="post__timestamp">·</span>
            <span className="post__timestamp">{Math.floor(Math.random() * 24)}h</span>
          </div>
          <IconButton className="post__more" size="small">
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </div>
        <div className="post__content">
          <p>{post}</p>
        </div>
        {photo && (
          <div className="post__image">
            <img src={photo} alt="Tweet media" />
          </div>
        )}
        <div className="post__footer">
          <div className="post__action">
            <IconButton 
              className={`post__action-btn reply-btn`}
              onClick={handleReply}
              size="small"
            >
              <ChatBubbleOutlineIcon fontSize="small" />
            </IconButton>
            {replyCount > 0 && <span className="post__action-count">{formatCount(replyCount)}</span>}
          </div>
          
          <div className="post__action">
            <IconButton 
              className={`post__action-btn retweet-btn ${retweeted ? 'retweeted' : ''}`}
              onClick={handleRetweet}
              size="small"
            >
              <RepeatIcon fontSize="small" />
            </IconButton>
            {retweetCount > 0 && <span className={`post__action-count ${retweeted ? 'retweeted' : ''}`}>{formatCount(retweetCount)}</span>}
          </div>
          
          <div className="post__action">
            <IconButton 
              className={`post__action-btn like-btn ${liked ? 'liked' : ''}`}
              onClick={handleLike}
              size="small"
            >
              {liked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </IconButton>
            {likeCount > 0 && <span className={`post__action-count ${liked ? 'liked' : ''}`}>{formatCount(likeCount)}</span>}
          </div>
          
          <div className="post__action">
            <IconButton 
              className="post__action-btn share-btn"
              onClick={handleShare}
              size="small"
            >
              <ShareOutlinedIcon fontSize="small" />
            </IconButton>
          </div>
          
          <div className="post__action">
            <IconButton 
              className={`post__action-btn bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmark}
              size="small"
            >
              {bookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
            </IconButton>
          </div>
        </div>
      </div>
    </div>
    
    {/* Comment Modal */}
    <Dialog open={showCommentModal} onClose={() => setShowCommentModal(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Reply to {name}</span>
          <IconButton onClick={() => setShowCommentModal(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        <div style={{ display: 'flex', marginBottom: '16px' }}>
          <Avatar src={profilephoto} sx={{ width: 40, height: 40, marginRight: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>{name}</strong> <span style={{ color: 'gray' }}>@{username}</span>
            </div>
            <div style={{ marginBottom: '16px' }}>{post}</div>
            <div style={{ color: 'gray', fontSize: '14px' }}>Replying to <span style={{ color: '#1DA1F2' }}>@{username}</span></div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <Avatar src={loggedinuser[0]?.profileImage || user?.photoURL} sx={{ width: 40, height: 40 }} />
          <TextField
            multiline
            rows={3}
            fullWidth
            placeholder="Tweet your reply"
            variant="outlined"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
          />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <Button
            variant="contained"
            onClick={handleCommentSubmit}
            disabled={!commentText.trim() || isCommenting}
            sx={{ 
              borderRadius: '20px',
              textTransform: 'none',
              backgroundColor: '#1DA1F2',
              '&:hover': { backgroundColor: '#0c85d0' }
            }}
          >
            {isCommenting ? <CircularProgress size={20} color="inherit" /> : 'Reply'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default Posts;
