import React, { useState, useRef, useEffect, useCallback } from "react";
import { Avatar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import GifBoxIcon from "@mui/icons-material/GifBox";
import PollIcon from "@mui/icons-material/Poll";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import "./ComposePost.css";
import useLoggedinuser from "../../hooks/useLoggedinuser";
import { useTheme } from "../../context/ThemeContext";

const ComposePost = () => {
  const [open, setOpen] = useState(false);
  const [tweetText, setTweetText] = useState("");
  const [loggedinuser] = useLoggedinuser();
  const { theme } = useTheme(); // Used for theme-aware styling
  const modalRef = useRef(null);
  const maxCharCount = 280;

  const handleOpen = useCallback(() => {
    setOpen(true);
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "auto";
  }, []);

  const handleClickOutside = useCallback((e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleClose();
    }
  }, [modalRef, handleClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "auto";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "auto";
    };
  }, [open, handleClickOutside]);

  const handleTweet = () => {
    // Handle tweet submission logic here
    console.log("Tweet submitted:", tweetText);
    setTweetText("");
    handleClose();
  };

  return (
    <>
      <button className="sidebar-tweet-btn" onClick={handleOpen}>
        Tweet
      </button>

      {open && (
        <>
          <div className="compose-modal-backdrop" onClick={handleClose}></div>
          <div className="compose-modal">
            <div className="compose-modal-content" ref={modalRef}>
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
              </div>
              <div className="compose-modal-footer">
                <div className="compose-actions">
                  <button className="action-btn" title="Media">
                    <ImageIcon className="action-icon" />
                  </button>
                  <button className="action-btn" title="GIF">
                    <GifBoxIcon className="action-icon" />
                  </button>
                  <button className="action-btn" title="Poll">
                    <PollIcon className="action-icon" />
                  </button>
                  <button className="action-btn" title="Emoji">
                    <EmojiEmotionsIcon className="action-icon" />
                  </button>
                  <button className="action-btn" title="Location">
                    <LocationOnIcon className="action-icon" />
                  </button>
                </div>
                <div className="compose-submit">
                  <span className="character-counter">
                    {tweetText.length > 0 ? `${tweetText.length}/${maxCharCount}` : ""}
                  </span>
                  <button
                    className="post-btn"
                    disabled={!tweetText.trim() || tweetText.length > maxCharCount}
                    onClick={handleTweet}
                  >
                    Tweet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ComposePost;