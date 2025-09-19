import React, { useRef, useState, useEffect } from 'react';
import { PlayArrow, Pause, VolumeUp, VolumeOff, Fullscreen, SkipNext, Comment } from '@mui/icons-material';
import './VideoPlayer.css';

const VideoPlayer = ({ src, poster, onNext, onClose }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [tapCount, setTapCount] = useState(0);
  const [tapTimer, setTapTimer] = useState(null);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [lastTapSide, setLastTapSide] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };

    const updateDuration = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', () => setIsPlaying(false));
    video.addEventListener('waiting', () => setIsBuffering(true));
    video.addEventListener('playing', () => setIsBuffering(false));
    video.addEventListener('canplay', () => setIsBuffering(false));

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', () => setIsPlaying(false));
      video.removeEventListener('waiting', () => setIsBuffering(true));
      video.removeEventListener('playing', () => setIsBuffering(false));
      video.removeEventListener('canplay', () => setIsBuffering(false));
    };
  }, []);
  
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };
  
  const toggleComments = () => {
    setShowComments(prev => !prev);
  };





  // Add keyboard shortcuts for desktop users
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore key events when user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case ' ': // Space bar
        case 'k': // YouTube-style shortcut
          e.preventDefault();
          togglePlay();
          showFeedback(isPlaying ? 'Paused' : 'Playing');
          break;
        case 'ArrowLeft':
        case 'j': // YouTube-style shortcut
          e.preventDefault();
          seek(-10);
          showFeedback('-10s');
          break;
        case 'ArrowRight':
        case 'l': // YouTube-style shortcut
          e.preventDefault();
          seek(10);
          showFeedback('+10s');
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          showFeedback(isMuted ? 'Unmuted' : 'Muted');
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'c':
          e.preventDefault();
          toggleComments();
          showFeedback(showComments ? 'Hiding Comments' : 'Showing Comments');
          break;
        case 'n':
          if (onNext) {
            e.preventDefault();
            onNext();
            showFeedback('Next Video');
          }
          break;
        case 'Escape':
          if (onClose) {
            e.preventDefault();
            showFeedback('Closing...');
            setTimeout(() => onClose(), 500);
          }
          break;
        default:
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isPlaying, isMuted, showComments, onNext, onClose]); // Dependencies for the keyboard shortcuts

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const seek = (seconds) => {
    const video = videoRef.current;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const handleProgressClick = (e) => {
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * video.duration;
    video.currentTime = newTime;
  };

  const handleGesture = (e, side) => {
    e.preventDefault();
    
    // Ignore gestures during buffering
    if (isBuffering) {
      showFeedback('Loading...', 1000);
      return;
    }
    
    const now = Date.now();
    const timeDiff = now - lastTapTime;

    // Reset tap count if too much time has passed or different side
    if (timeDiff > 300 || lastTapSide !== side) {
      setTapCount(1);
    } else {
      setTapCount(prev => prev + 1);
    }

    setLastTapTime(now);
    setLastTapSide(side);

    // Clear existing timer
    if (tapTimer) {
      clearTimeout(tapTimer);
    }
    
    // Provide haptic feedback if supported
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    // Set new timer to execute gesture
    const timer = setTimeout(() => {
      executeGesture(tapCount + (timeDiff <= 500 && lastTapSide === side ? 0 : 0), side);
      setTapCount(0);
    }, 300);

    setTapTimer(timer);
  };

  // Show visual feedback for gestures
  const showFeedback = (message, duration = 800) => {
    setFeedback(message);
    setFeedbackVisible(true);
    
    // Clear any existing timeout
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    
    // Set new timeout
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedbackVisible(false);
      setTimeout(() => setFeedback(null), 300); // Clear text after fade out animation
    }, duration);
  };
  

  
  const executeGesture = (count, side) => {
    switch (count) {
      case 1:
        if (side === 'center') {
          togglePlay();
          showFeedback(isPlaying ? 'Paused' : 'Playing');
        }
        break;
      case 2:
        if (side === 'left') {
          seek(-10);
          showFeedback('-10s');
        } else if (side === 'right') {
          seek(10);
          showFeedback('+10s');
        }
        break;
      case 3:
        if (side === 'center' && onNext) {
          onNext();
          showFeedback('Next Video');
        } else if (side === 'right' && onClose) {
          showFeedback('Closing...');
          setTimeout(() => onClose(), 500);
        } else if (side === 'left') {
          toggleComments();
          showFeedback(showComments ? 'Hiding Comments' : 'Showing Comments');
        }
        break;
      default:
        break;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className="video-player-container"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="video-player"
        onClick={(e) => e.preventDefault()}
      />
      
      {/* Gesture Areas */}
      <div className="gesture-areas">
        <div 
          className="gesture-area left"
          onTouchEnd={(e) => handleGesture(e, 'left')}
          onClick={(e) => handleGesture(e, 'left')}
        />
        <div 
          className="gesture-area center"
          onTouchEnd={(e) => handleGesture(e, 'center')}
          onClick={(e) => handleGesture(e, 'center')}
        />
        <div 
          className="gesture-area right"
          onTouchEnd={(e) => handleGesture(e, 'right')}
          onClick={(e) => handleGesture(e, 'right')}
        />
      </div>

      {/* Controls */}
      {showControls && (
        <div className="video-controls">
          <div className="progress-container">
            <div 
              className="progress-bar"
              onClick={handleProgressClick}
            >
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <div className="control-buttons">
            <button onClick={togglePlay} className="control-btn">
              {isPlaying ? <Pause /> : <PlayArrow />}
            </button>
            
            <button onClick={toggleMute} className="control-btn">
              {isMuted ? <VolumeOff /> : <VolumeUp />}
            </button>
            
            <span className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            
            {onNext && (
              <button onClick={onNext} className="control-btn">
                <SkipNext />
              </button>
            )}
            
            <button onClick={toggleFullscreen} className="control-btn">
              <Fullscreen />
            </button>
          </div>
        </div>
      )}

      {/* Gesture Hints */}
      <div className="gesture-hints">
        <div className="hint left-hint">
          Double-tap: -10s<br/>
          Triple-tap: Comments
        </div>
        <div className="hint center-hint">
          Single-tap: Play/Pause<br/>
          Triple-tap: Next Video
        </div>
        <div className="hint right-hint">
          Double-tap: +10s<br/>
          Triple-tap: Close
        </div>
      </div>
      
      {/* Keyboard Shortcuts Info Button */}
      <div className="keyboard-shortcuts-info">
        <button 
          className="keyboard-info-btn" 
          onClick={() => setFeedback(
            'Keyboard Shortcuts: Space/K: Play/Pause, J/←: -10s, L/→: +10s, M: Mute, F: Fullscreen, C: Comments, N: Next, ESC: Close',
            3000
          )}
        >
          ⌨️
        </button>
      </div>
      
      {/* Visual Feedback */}
      {feedback && (
        <div className="feedback-overlay">
          <div className="feedback-message">{feedback}</div>
        </div>
      )}
      
      {/* Loading Spinner */}
      {isBuffering && (
        <div className="buffering-overlay">
          <div className="spinner"></div>
        </div>
      )}
      
      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          <div className="comments-header">
            <h3><Comment /> Comments</h3>
            <button onClick={toggleComments} className="close-btn">×</button>
          </div>
          <div className="comments-content">
            {/* This would be populated with actual comments */}
            <div className="comment">
              <div className="comment-avatar"></div>
              <div className="comment-body">
                <div className="comment-user">User123</div>
                <div className="comment-text">Great video! Thanks for sharing.</div>
              </div>
            </div>
            <div className="comment">
              <div className="comment-avatar"></div>
              <div className="comment-body">
                <div className="comment-user">VideoFan</div>
                <div className="comment-text">I love the gesture controls, very intuitive!</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
