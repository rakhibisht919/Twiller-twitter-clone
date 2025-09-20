import React, { useState } from "react";
import "./Tweetbox.css";
import { Avatar, Button, IconButton, CircularProgress } from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import GifBoxOutlinedIcon from "@mui/icons-material/GifBoxOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CloseIcon from "@mui/icons-material/Close";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import axios from "axios";
import { useUserAuth } from "../../../context/UserAuthContext";
import useLoggedinuser from "../../../hooks/useLoggedinuser";
import API_BASE_URL from "../../../config/api";
import VideoPlayer from "../../../components/VideoPlayer/VideoPlayer";
import EmojiPicker from "../../../components/ComposePost/EmojiPicker";
import LocationPicker from "../../../components/ComposePost/LocationPicker";
import GifPicker from "../../../components/ComposePost/GifPicker";
import PollCreator from "../../../components/ComposePost/PollCreator";

const Tweetbox = () => {
  const [post, setpost] = useState("");
  const [imageurl, setimageurl] = useState("");
  const [videourl, setvideourl] = useState("");
  const [mediaType, setMediaType] = useState(""); // "image" or "video"
  const [isloading, setisloading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  // Removed unused state variables: name, setname, username, setusername
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [charCount, setCharCount] = useState(0);
  const maxChars = 280;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedGif, setSelectedGif] = useState(null);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState('1 day');
  const [hasPoll, setHasPoll] = useState(false);
  
  const { user } = useUserAuth();
  const [loggedinuser] = useLoggedinuser(); // Removed unused setLoggedinuser and loading variables
  const email = user?.email;
  const userprofilepic = loggedinuser[0]?.profileImage
    ? loggedinuser[0].profileImage
    : user && user.photoURL;

  const handleMediaUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setisloading(true);
    setError("");

    try {
      // Validate file type
      if (type === 'image' && !file.type.startsWith('image/')) {
        setError("Please select a valid image file");
        setisloading(false);
        return;
      } else if (type === 'video' && !file.type.startsWith('video/')) {
        setError("Please select a valid video file");
        setisloading(false);
        return;
      }

      // Validate file size
      const maxSize = type === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB for images, 50MB for videos
      const sizeLabel = type === 'image' ? "Image" : "Video";
      
      if (file.size > maxSize) {
        setError(`${sizeLabel} size should be less than ${maxSize / (1024 * 1024)}MB`);
        setisloading(false);
        return;
      }

      let mediaUrl = null;

      // For images, try external services first
      if (type === 'image') {
        // Method 1: Try ImgBB
        try {
          const formData = new FormData();
          formData.append('image', file);
          
          const response = await axios.post(
            'https://api.imgbb.com/1/upload?key=b0ea2f6cc0f276633b2a8a86d2c43335',
            formData,
            {
              timeout: 30000,
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          
          if (response.data && response.data.data && response.data.data.display_url) {
            mediaUrl = response.data.data.display_url;
          }
        } catch (imgbbError) {
          console.log('ImgBB failed, trying alternative method:', imgbbError.message);
        }

        // Method 2: Try Cloudinary (free tier)
        if (!mediaUrl) {
          try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'ml_default');
            
            const response = await axios.post(
              'https://api.cloudinary.com/v1_1/demo/image/upload',
              formData,
              { timeout: 30000 }
            );
            
            if (response.data && response.data.secure_url) {
              mediaUrl = response.data.secure_url;
            }
          } catch (cloudinaryError) {
            console.log('Cloudinary failed, using base64 fallback:', cloudinaryError.message);
          }
        }
      }

      // Base64 fallback for both image and video
      if (!mediaUrl) {
        try {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          
          mediaUrl = base64;
          console.log(`Using base64 fallback for ${type} upload`);
        } catch (base64Error) {
          throw new Error('All upload methods failed');
        }
      }

      if (mediaUrl) {
        if (type === 'image') {
          // Clear any existing video
          setvideourl("");
          setimageurl(mediaUrl);
          setMediaType("image");
          setSuccess("Image uploaded successfully!");
        } else {
          // Clear any existing image
          setimageurl("");
          setvideourl(mediaUrl);
          setMediaType("video");
          setSuccess("Video uploaded successfully!");
        }
        setTimeout(() => setSuccess(""), 3000);
      } else {
        throw new Error(`Failed to get ${type} URL`);
      }

    } catch (error) {
      console.error(`${type} upload failed:`, error);
      setError(`Failed to upload ${type}. Please try again.`);
      setTimeout(() => setError(""), 3000);
    } finally {
      setisloading(false);
      // Clear input so same file can be selected again
      e.target.value = '';
    }
  };

  const handleuploadimage = (e) => {
    handleMediaUpload(e, 'image');
  };

  const handleuploadVideo = (e) => {
    handleMediaUpload(e, 'video');
  };

  const handlePostChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setpost(value);
      setCharCount(value.length);
    }
  };

  const removeMedia = () => {
    setimageurl("");
    setvideourl("");
    setSelectedGif(null);
    setMediaType("");
  };

  const handletweet = async (e) => {
    e.preventDefault();
    if (post.trim() === "" || charCount > maxChars) return;
    
    setError("");
    setSuccess("");
    setIsPosting(true);

    try {
      let userName = "";
      let displayName = "";

      if (user?.providerData[0]?.providerId === "password") {
        try {
          const response = await fetch(`${API_BASE_URL}/loggedinuser?email=${email}`);
          if (response.ok) {
            const data = await response.json();
            displayName = data[0]?.name || user?.displayName || email?.split("@")[0];
            userName = data[0]?.username || email?.split("@")[0];
          } else {
            throw new Error("Failed to fetch user data");
          }
        } catch (err) {
          console.error("Failed to fetch user data:", err.message);
          displayName = user?.displayName || email?.split("@")[0];
          userName = email?.split("@")[0];
        }
      } else {
        displayName = user?.displayName || email?.split("@")[0];
        userName = email?.split("@")[0];
      }

      const userpost = {
        profilephoto: userprofilepic,
        post: post,
        photo: imageurl,
        video: videourl,
        gif: selectedGif,
        mediaType: mediaType,
        username: userName,
        name: displayName,
        email: email,
        location: selectedLocation,
        poll: hasPoll ? {
          options: pollOptions.filter(opt => opt.trim()),
          duration: pollDuration,
          votes: pollOptions.filter(opt => opt.trim()).map(() => 0),
          totalVotes: 0,
          votedUsers: []
        } : null,
      };

      try {
        const response = await fetch(`${API_BASE_URL}/post`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(userpost),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setSuccess("Tweet posted successfully!");
          setpost("");
          setimageurl("");
          setvideourl("");
          setSelectedGif(null);
          setMediaType("");
          setCharCount(0);
          setSelectedLocation(null);
          setHasPoll(false);
          setPollOptions(['', '']);
          setPollDuration('1 day');
          setTimeout(() => setSuccess(""), 3000);
        } else {
          throw new Error("Failed to post tweet");
        }
      } catch (err) {
        console.error("Failed to post tweet:", err.message);
        setError("Failed to post tweet. Please try again.");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      setError("Failed to post tweet. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsPosting(false);
    }
  };

  const getCharCountColor = () => {
    if (charCount > maxChars) return '#f4212e';
    if (charCount > maxChars * 0.8) return '#ffd400';
    return '#1d9bf0';
  };

  const getCircleProgress = () => {
    return (charCount / maxChars) * 100;
  };

  const handleEmojiSelect = (emoji) => {
    const newPost = post + emoji;
    if (newPost.length <= maxChars) {
      setpost(newPost);
      setCharCount(newPost.length);
    }
    setShowEmojiPicker(false);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setShowLocationPicker(false);
  };

  const handleGifSelect = (gif) => {
    setSelectedGif(gif);
    // Clear other media when GIF is selected
    setimageurl("");
    setvideourl("");
    setMediaType("gif");
    setShowGifPicker(false);
  };

  const handlePollToggle = () => {
    if (hasPoll) {
      setHasPoll(false);
      setPollOptions(['', '']);
      setPollDuration('1 day');
    } else {
      setShowPollCreator(true);
    }
  };

  const handlePollCreate = () => {
    const validOptions = pollOptions.filter(option => option.trim() !== '');
    if (validOptions.length >= 2) {
      setHasPoll(true);
      setShowPollCreator(false);
    }
  };

  return (
    <div className="tweetBox">
      {error && <div className="tweetbox-error">{error}</div>}
      {success && <div className="tweetbox-success">{success}</div>}
      
      <form onSubmit={handletweet}>
        <div className="tweetBox__input">
          <Avatar
            src={
              loggedinuser[0]?.profileImage
                ? loggedinuser[0].profileImage
                : user && user.photoURL
            }
            sx={{ width: 40, height: 40 }}
          />
          <div className="tweetBox__inputContainer">
            <textarea
              className="tweetBox__textarea"
              placeholder="What's happening?"
              onChange={handlePostChange}
              value={post}
              rows={3}
              maxLength={maxChars}
            />
            {mediaType === "image" && imageurl && (
              <div className="tweetBox__imagePreview">
                <img src={imageurl} alt="Preview" />
                <IconButton 
                  className="tweetBox__removeImage"
                  onClick={removeMedia}
                  size="small"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
            )}
            {mediaType === "video" && videourl && (
              <div className="tweetBox__videoPreview">
                <VideoPlayer 
                  src={videourl} 
                  onClose={removeMedia}
                />
                <IconButton 
                  className="tweetBox__removeImage"
                  onClick={removeMedia}
                  size="small"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
            )}
            {mediaType === "gif" && selectedGif && (
              <div className="tweetBox__gifPreview">
                <img src={selectedGif.url} alt={selectedGif.title || "GIF"} />
                <IconButton 
                  className="tweetBox__removeImage"
                  onClick={removeMedia}
                  size="small"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
            )}
            {selectedLocation && (
              <div className="tweetBox__selectedLocation">
                <LocationOnOutlinedIcon fontSize="small" />
                <span>{selectedLocation.name}</span>
                <IconButton 
                  size="small" 
                  onClick={() => setSelectedLocation(null)}
                  title="Remove location"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
            )}
            {hasPoll && (
              <div className="tweetBox__pollPreview">
                <div className="poll-preview-header">
                  <span>Poll • {pollDuration}</span>
                  <IconButton 
                    size="small" 
                    onClick={() => setHasPoll(false)}
                    title="Remove poll"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </div>
                {pollOptions.filter(opt => opt.trim()).map((option, index) => (
                  <div key={index} className="poll-option-preview">
                    <div className="poll-option-text">{option}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {showEmojiPicker && (
          <div className="tweetBox__emojiPicker">
            <EmojiPicker 
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}
        
        {showLocationPicker && (
          <div className="tweetBox__locationPicker">
            <LocationPicker 
              onLocationSelect={handleLocationSelect}
              onClose={() => setShowLocationPicker(false)}
            />
          </div>
        )}
        
        {showGifPicker && (
          <div className="tweetBox__gifPicker">
            <GifPicker 
              onGifSelect={handleGifSelect}
              onClose={() => setShowGifPicker(false)}
            />
          </div>
        )}
        
        {showPollCreator && (
          <div className="tweetBox__pollCreator">
            <PollCreator 
              pollOptions={pollOptions}
              setPollOptions={setPollOptions}
              pollDuration={pollDuration}
              setPollDuration={setPollDuration}
              onClose={() => {
                setShowPollCreator(false);
                handlePollCreate();
              }}
            />
          </div>
        )}
        
        <div className="tweetBox__actions">
          <div className="tweetBox__options">
            <IconButton 
              className="tweetBox__option" 
              component="label" 
              htmlFor="image" 
              disabled={isloading} 
              title="Upload image"
            >
              {isloading && mediaType === "image" ? (
                <CircularProgress size={20} />
              ) : (
                <AddPhotoAlternateOutlinedIcon />
              )}
            </IconButton>
            <input
              type="file"
              id="image"
              className="imageInput"
              onChange={handleuploadimage}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            <IconButton 
              className="tweetBox__option" 
              component="label" 
              htmlFor="video" 
              disabled={isloading} 
              title="Upload video"
            >
              {isloading && mediaType === "video" ? (
                <CircularProgress size={20} />
              ) : (
                <VideocamOutlinedIcon />
              )}
            </IconButton>
            <input
              type="file"
              id="video"
              className="videoInput"
              onChange={handleuploadVideo}
              accept="video/*"
              style={{ display: 'none' }}
            />
            
            <IconButton 
              className="tweetBox__option" 
              onClick={() => setShowGifPicker(!showGifPicker)}
              title="Add GIF"
            >
              <GifBoxOutlinedIcon />
            </IconButton>
            <IconButton 
              className="tweetBox__option" 
              onClick={handlePollToggle}
              title={hasPoll ? "Remove poll" : "Add poll"}
              style={{ color: hasPoll ? '#1d9bf0' : 'inherit' }}
            >
              <PollOutlinedIcon />
            </IconButton>
            <IconButton 
              className="tweetBox__option" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Add emoji"
            >
              <EmojiEmotionsOutlinedIcon />
            </IconButton>
            <IconButton 
              className="tweetBox__option" 
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              title="Add location"
            >
              <LocationOnOutlinedIcon />
            </IconButton>
          </div>
          
          <div className="tweetBox__submit">
            {charCount > 0 && (
              <div className="tweetBox__charCount">
                <div className="char-count-circle">
                  <CircularProgress
                    variant="determinate"
                    value={Math.min(getCircleProgress(), 100)}
                    size={20}
                    thickness={4}
                    sx={{
                      color: getCharCountColor(),
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      },
                    }}
                  />
                  {charCount > maxChars - 20 && (
                    <span className="char-count-text" style={{ color: getCharCountColor() }}>
                      {maxChars - charCount}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <Button 
              className="tweetBox__tweetButton" 
              type="submit"
              disabled={post.trim() === "" || charCount > maxChars || isPosting}
              variant="contained"
            >
              {isPosting ? <CircularProgress size={20} color="inherit" /> : "Tweet"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Tweetbox;
