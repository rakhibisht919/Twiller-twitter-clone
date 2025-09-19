import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Avatar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import GifBoxIcon from "@mui/icons-material/GifBox";
import PollIcon from "@mui/icons-material/Poll";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import "./ComposePost.css";
import useLoggedinuser from "../../hooks/useLoggedinuser";
import { useTheme } from "../../context/ThemeContext";
import EmojiPicker from "./EmojiPicker";
import GifPicker from "./GifPicker";
import PollCreator from "./PollCreator";
import LocationPicker from "./LocationPicker";
import VideoPicker from "./VideoPicker";

const ComposePost = () => {
  const [open, setOpen] = useState(false);
  const [tweetText, setTweetText] = useState("");
  const [loggedinuser] = useLoggedinuser();
  
  // Media and content state
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [selectedGif, setSelectedGif] = useState(null);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState('1 day');
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // UI state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showVideoPicker, setShowVideoPicker] = useState(false);
  
  // Refs
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  
  const maxCharCount = 280;
  const maxImages = 4;
  const maxVideoSize = 512 * 1024 * 1024; // 512MB

  const handleOpen = useCallback(() => {
    setOpen(true);
    // Store current scroll position
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.classList.add("modal-open");
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    // Reset all state
    setTweetText("");
    setSelectedImages([]);
    setSelectedVideos([]);
    setSelectedGif(null);
    setPollOptions(['', '']);
    setSelectedLocation(null);
    setShowEmojiPicker(false);
    setShowGifPicker(false);
    setShowPollCreator(false);
    setShowLocationPicker(false);
    setShowVideoPicker(false);
    
    // Restore scroll position
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.classList.remove("modal-open");
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  }, []);

  // Media handling functions
  const handleMediaSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    const totalMedia = selectedImages.length + selectedVideos.length;
    
    if (files.length + totalMedia > maxImages) {
      alert(`You can only select up to ${maxImages} media files.`);
      return;
    }
    
    files.forEach(file => {
      // Check video file size
      if (file.type.startsWith('video/') && file.size > maxVideoSize) {
        alert(`Video file "${file.name}" is too large. Maximum size is 512MB.`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const mediaItem = {
          id: Date.now() + Math.random(),
          file: file,
          url: event.target.result,
          name: file.name,
          type: file.type,
          size: file.size
        };
        
        if (file.type.startsWith('image/')) {
          setSelectedImages(prev => [...prev, mediaItem]);
        } else if (file.type.startsWith('video/')) {
          setSelectedVideos(prev => [...prev, mediaItem]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [selectedImages.length, selectedVideos.length, maxImages]);

  const removeImage = useCallback((imageId) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  }, []);

  const removeVideo = useCallback((videoId) => {
    setSelectedVideos(prev => prev.filter(video => video.id !== videoId));
  }, []);

  const handleMediaClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleGifClick = useCallback(() => {
    setShowGifPicker(prev => !prev);
    setShowEmojiPicker(false);
    setShowLocationPicker(false);
    setShowVideoPicker(false);
  }, []);

  const handlePollClick = useCallback(() => {
    setShowPollCreator(prev => !prev);
    setShowEmojiPicker(false);
    setShowGifPicker(false);
    setShowLocationPicker(false);
    setShowVideoPicker(false);
    // Clear other media when creating poll
    if (!showPollCreator) {
      setSelectedImages([]);
      setSelectedVideos([]);
      setSelectedGif(null);
    }
  }, [showPollCreator]);

  const handleEmojiClick = useCallback(() => {
    setShowEmojiPicker(prev => !prev);
    setShowGifPicker(false);
    setShowPollCreator(false);
    setShowLocationPicker(false);
    setShowVideoPicker(false);
  }, []);

  const handleLocationClick = useCallback(() => {
    setShowLocationPicker(prev => !prev);
    setShowEmojiPicker(false);
    setShowGifPicker(false);
    setShowPollCreator(false);
    setShowVideoPicker(false);
  }, []);

  const handleVideoClick = useCallback(() => {
    setShowVideoPicker(prev => !prev);
    setShowEmojiPicker(false);
    setShowGifPicker(false);
    setShowPollCreator(false);
    setShowLocationPicker(false);
    // Clear other media when selecting video
    if (!showVideoPicker) {
      setSelectedGif(null);
      setSelectedImages([]);
      setPollOptions(['', '']);
      setShowPollCreator(false);
    }
  }, [showVideoPicker]);

  // Content selection handlers
  const handleEmojiSelect = useCallback((emoji) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = tweetText.substring(0, start) + emoji + tweetText.substring(end);
      setTweetText(newText);
      
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    }
    setShowEmojiPicker(false);
  }, [tweetText]);

  const handleGifSelect = useCallback((gif) => {
    setSelectedGif(gif);
    // Clear other media when selecting GIF
    setSelectedImages([]);
    setSelectedVideos([]);
    setPollOptions(['', '']);
    setShowPollCreator(false);
  }, []);

  const handleLocationSelect = useCallback((location) => {
    setSelectedLocation(location);
  }, []);

  const handleVideoSelect = useCallback((video) => {
    setSelectedVideos([video]); // Replace existing videos with new one
    // Clear other media when selecting video
    setSelectedImages([]);
    setSelectedGif(null);
    setPollOptions(['', '']);
    setShowPollCreator(false);
  }, []);

  const handleClickOutside = useCallback((e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleClose();
    }
  }, [modalRef, handleClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Cleanup on component unmount
      document.body.classList.remove("modal-open");
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [open, handleClickOutside]);

  const handleTweet = () => {
    // Prepare tweet data
    const tweetData = {
      text: tweetText,
      images: selectedImages,
      videos: selectedVideos,
      gif: selectedGif,
      poll: showPollCreator ? {
        options: pollOptions.filter(option => option.trim() !== ''),
        duration: pollDuration
      } : null,
      location: selectedLocation,
      timestamp: new Date().toISOString()
    };

    // Handle tweet submission logic here
    console.log("Tweet submitted:", tweetData);
    
    // TODO: Send to backend API
    // await postTweet(tweetData);
    
    handleClose();
  };

  return (
    <>
      <button className="sidebar-tweet-btn" onClick={handleOpen}>
        Tweet
      </button>

      {open && createPortal(
        <div className="compose-modal-backdrop" onClick={handleClose}>
          <div className="compose-modal">
            <div className="compose-modal-content" ref={modalRef} onClick={(e) => e.stopPropagation()}>
              <div className="compose-modal-header">
                <button className="close-btn" onClick={handleClose}>
                  <CloseIcon />
                </button>
              </div>
              <div className="compose-modal-body">
                <div className="compose-user-content">
                  <Avatar
                    src={loggedinuser[0]?.profileImage}
                    alt={loggedinuser[0]?.name}
                    className="compose-avatar"
                  />
                  <div className="compose-input-container">
                    <textarea
                      ref={textareaRef}
                      className="compose-textarea"
                      placeholder="What's happening?"
                      value={tweetText}
                      onChange={(e) => setTweetText(e.target.value)}
                      rows={2}
                      maxLength={maxCharCount}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Image Previews */}
                {selectedImages.length > 0 && (
                  <div className="image-previews">
                    {selectedImages.map((image) => (
                      <div key={image.id} className="image-preview">
                        <img src={image.url} alt="Preview" />
                        <button 
                          onClick={() => removeImage(image.id)}
                          className="remove-image-btn"
                          title="Remove image"
                        >
                          <CloseIcon fontSize="small" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Video Previews */}
                {selectedVideos.length > 0 && (
                  <div className="video-previews">
                    {selectedVideos.map((video) => (
                      <div key={video.id} className="video-preview">
                        <video 
                          src={video.url} 
                          controls 
                          muted
                          preload="metadata"
                          className="video-player"
                        >
                          Your browser does not support the video tag.
                        </video>
                        <button 
                          onClick={() => removeVideo(video.id)}
                          className="remove-video-btn"
                          title="Remove video"
                        >
                          <CloseIcon fontSize="small" />
                        </button>
                        <div className="video-info">
                          <span className="video-name">{video.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* GIF Preview */}
                {selectedGif && (
                  <div className="gif-preview">
                    <img src={selectedGif.url} alt={selectedGif.title} />
                    <button 
                      onClick={() => setSelectedGif(null)}
                      className="remove-gif-btn"
                      title="Remove GIF"
                    >
                      <CloseIcon fontSize="small" />
                    </button>
                  </div>
                )}

                {/* Poll Creator */}
                {showPollCreator && (
                  <PollCreator
                    pollOptions={pollOptions}
                    setPollOptions={setPollOptions}
                    pollDuration={pollDuration}
                    setPollDuration={setPollDuration}
                    onClose={() => setShowPollCreator(false)}
                  />
                )}

                {/* Location Display */}
                {selectedLocation && (
                  <div className="selected-location">
                    <LocationOnIcon className="location-icon" />
                    <div className="location-info">
                      <span className="location-name">{selectedLocation.name}</span>
                      <span className="location-address">{selectedLocation.address}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedLocation(null)}
                      className="remove-location-btn"
                      title="Remove location"
                    >
                      <CloseIcon fontSize="small" />
                    </button>
                  </div>
                )}
              </div>
              <div className="compose-modal-footer">
                <div className="compose-actions">
                  <div className="action-btn-container">
                    <button 
                      className="action-btn" 
                      title="Photos"
                      onClick={handleMediaClick}
                      disabled={selectedGif || showPollCreator || selectedVideos.length > 0}
                    >
                      <ImageIcon className="action-icon" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMediaSelect}
                      style={{ display: 'none' }}
                    />
                  </div>
                  
                  <div className="action-btn-container">
                    <button 
                      className={`action-btn ${showVideoPicker ? 'active' : ''}`}
                      title="Video"
                      onClick={handleVideoClick}
                      disabled={selectedGif || showPollCreator || selectedImages.length > 0}
                    >
                      <VideoLibraryIcon className="action-icon" />
                    </button>
                    {showVideoPicker && (
                      <VideoPicker
                        onVideoSelect={handleVideoSelect}
                        onClose={() => setShowVideoPicker(false)}
                      />
                    )}
                  </div>
                  
                  <div className="action-btn-container">
                    <button 
                      className={`action-btn ${showGifPicker ? 'active' : ''}`}
                      title="GIF"
                      onClick={handleGifClick}
                      disabled={selectedImages.length > 0 || selectedVideos.length > 0 || showPollCreator}
                    >
                      <GifBoxIcon className="action-icon" />
                    </button>
                    {showGifPicker && (
                      <GifPicker
                        onGifSelect={handleGifSelect}
                        onClose={() => setShowGifPicker(false)}
                      />
                    )}
                  </div>
                  
                  <div className="action-btn-container">
                    <button 
                      className={`action-btn ${showPollCreator ? 'active' : ''}`}
                      title="Poll"
                      onClick={handlePollClick}
                      disabled={selectedImages.length > 0 || selectedVideos.length > 0 || selectedGif}
                    >
                      <PollIcon className="action-icon" />
                    </button>
                  </div>
                  
                  <div className="action-btn-container">
                    <button 
                      className={`action-btn ${showEmojiPicker ? 'active' : ''}`}
                      title="Emoji"
                      onClick={handleEmojiClick}
                    >
                      <EmojiEmotionsIcon className="action-icon" />
                    </button>
                    {showEmojiPicker && (
                      <EmojiPicker
                        onEmojiSelect={handleEmojiSelect}
                        onClose={() => setShowEmojiPicker(false)}
                      />
                    )}
                  </div>
                  
                  <div className="action-btn-container">
                    <button 
                      className={`action-btn ${showLocationPicker ? 'active' : ''}`}
                      title="Location"
                      onClick={handleLocationClick}
                    >
                      <LocationOnIcon className="action-icon" />
                    </button>
                    {showLocationPicker && (
                      <LocationPicker
                        onLocationSelect={handleLocationSelect}
                        onClose={() => setShowLocationPicker(false)}
                      />
                    )}
                  </div>
                </div>
                <div className="compose-submit">
                  <span className="character-counter">
                    {tweetText.length > 0 ? `${tweetText.length}/${maxCharCount}` : ""}
                  </span>
                  <button
                    className="post-btn"
                    disabled={
                      (!tweetText.trim() && !selectedImages.length && !selectedVideos.length && !selectedGif && !showPollCreator) ||
                      tweetText.length > maxCharCount ||
                      (showPollCreator && pollOptions.filter(opt => opt.trim()).length < 2)
                    }
                    onClick={handleTweet}
                  >
                    Tweet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ComposePost;