import { useState } from "react";
import "./components/ComposeModal/ComposeModal.css";

// Icons (using simple SVG icons to match Twitter/X style)
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
  </svg>
);

const GifIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm1 2h10a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />
  </svg>
);

const PollIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
  </svg>
);

const EmojiIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
  </svg>
);

export default function ComposePost() {
  const [isOpen, setIsOpen] = useState(false);
  const [tweetText, setTweetText] = useState("");
  const maxCharacters = 280;

  const handleTweetChange = (e) => {
    if (e.target.value.length <= maxCharacters) {
      setTweetText(e.target.value);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTweetText("");
  };

  const handlePost = () => {
    // Add your post logic here
    console.log("Posted:", tweetText);
    handleClose();
  };

  const remainingCharacters = maxCharacters - tweetText.length;
  const isOverLimit = remainingCharacters < 0;
  const canPost = tweetText.trim().length > 0 && !isOverLimit;

  return (
    <div>
      {/* Post Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-full"
      >
        Post
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="compose-modal">
          {/* Backdrop */}
          <div 
            className="compose-modal-backdrop" 
            onClick={handleClose}
          ></div>
          
          {/* Modal */}
          <div className="compose-modal-content">
            {/* Header */}
            <div className="compose-modal-header">
              <button
                onClick={handleClose}
                className="close-btn"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Compose Section */}
            <div className="compose-modal-body">
              <div className="compose-content">
                {/* Profile Image */}
                <img
                  src="https://via.placeholder.com/40"
                  alt="profile"
                  className="user-avatar rounded-full w-10 h-10"
                />
                
                {/* Input Section */}
                <div className="compose-input-section">
                  {/* Textarea */}
                  <textarea
                    className="compose-textarea w-full resize-none border-none outline-none bg-transparent text-gray-900 dark:text-gray-100 text-lg"
                    placeholder="What's happening?"
                    value={tweetText}
                    onChange={handleTweetChange}
                    maxLength={maxCharacters}
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
<div className="compose-modal-footer">
  <div className="action-buttons">
    <button className="action-btn"><ImageIcon /></button>
    <button className="action-btn"><GifIcon /></button>
    <button className="action-btn"><PollIcon /></button>
    <button className="action-btn"><EmojiIcon /></button>
    <span>📍</span>
  </div>
  <div className="compose-actions">
    <span className={`character-count ${isOverLimit ? "over-limit" : ""}`}>
      {remainingCharacters}
    </span>
    <button
      onClick={handlePost}
      disabled={!canPost}
      className="post-btn"
    >
      Tweet
    </button>
  </div>
</div>
          </div>
        </div>
      )}
    </div>
  );
}