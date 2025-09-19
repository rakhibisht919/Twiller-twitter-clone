import React, { useState, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import './VideoPicker.css';

const VideoPicker = ({ onVideoSelect, onClose }) => {
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  
  const maxVideoSize = 512 * 1024 * 1024; // 512MB
  const maxVideos = 1; // Twitter typically allows 1 video per tweet
  const supportedFormats = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    
    if (selectedVideos.length + fileArray.length > maxVideos) {
      alert(`You can only select up to ${maxVideos} video at a time.`);
      return;
    }
    
    fileArray.forEach(file => {
      // Check file type
      if (!supportedFormats.includes(file.type)) {
        alert(`Video format "${file.type}" is not supported. Please use MP4, MOV, AVI, MKV, or WebM.`);
        return;
      }
      
      // Check file size
      if (file.size > maxVideoSize) {
        alert(`Video file "${file.name}" is too large. Maximum size is 512MB.`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const videoItem = {
          id: Date.now() + Math.random(),
          file: file,
          url: event.target.result,
          name: file.name,
          type: file.type,
          size: file.size,
          duration: 0 // Will be set when video loads
        };
        
        setSelectedVideos(prev => [...prev, videoItem]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleVideoSelect = (video) => {
    onVideoSelect(video);
    onClose();
  };

  const removeVideo = (videoId) => {
    setSelectedVideos(prev => prev.filter(video => video.id !== videoId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoLoad = (videoId, duration) => {
    setSelectedVideos(prev => 
      prev.map(video => 
        video.id === videoId ? { ...video, duration } : video
      )
    );
  };

  return (
    <div className="video-picker">
      <div className="video-picker-header">
        <div className="video-picker-title">
          <VideoLibraryIcon className="title-icon" />
          <span>Select Video</span>
        </div>
        <button onClick={onClose} className="video-close-btn">
          <CloseIcon />
        </button>
      </div>
      
      <div className="video-picker-content">
        {selectedVideos.length === 0 ? (
          <div 
            className={`video-upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <VideoLibraryIcon className="upload-icon" />
            <h3>Select a video to upload</h3>
            <p>Drag and drop or click to browse</p>
            <div className="upload-info">
              <span>• Maximum file size: 512MB</span>
              <span>• Supported formats: MP4, MOV, AVI, MKV, WebM</span>
              <span>• Maximum duration: 2 minutes 20 seconds</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleInputChange}
              style={{ display: 'none' }}
              multiple={false}
            />
          </div>
        ) : (
          <div className="video-preview-container">
            {selectedVideos.map(video => (
              <div key={video.id} className="video-preview-item">
                <div className="video-preview-wrapper">
                  <video
                    src={video.url}
                    controls
                    muted
                    preload="metadata"
                    className="video-preview"
                    onLoadedMetadata={(e) => handleVideoLoad(video.id, e.target.duration)}
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
                </div>
                <div className="video-details">
                  <div className="video-name" title={video.name}>{video.name}</div>
                  <div className="video-meta">
                    <span className="video-size">{formatFileSize(video.size)}</span>
                    {video.duration > 0 && (
                      <span className="video-duration">{formatDuration(video.duration)}</span>
                    )}
                  </div>
                </div>
                <button 
                  className="select-video-btn"
                  onClick={() => handleVideoSelect(video)}
                >
                  <PlayArrowIcon />
                  Use this video
                </button>
              </div>
            ))}
            <button 
              className="add-another-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={selectedVideos.length >= maxVideos}
            >
              Choose different video
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleInputChange}
              style={{ display: 'none' }}
              multiple={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPicker;