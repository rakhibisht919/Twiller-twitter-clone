import React from 'react';
import './EmojiPicker.css';

const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐'],
    'Gestures': ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💔', '❣️'],
    'Objects': ['🎉', '🎊', '🔥', '⭐', '✨', '💫', '⚡', '💥', '💨', '💦', '💤', '🎯', '🎪', '🎭', '🎨', '🎬', '🎵', '🎶', '🎸', '🎺', '🥳'],
    'Nature': ['🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌿', '🍀', '🌱', '🌳', '🌲', '🌴', '🌵', '🌾', '🌽', '🍎', '🍊', '🍋', '🍌', '🍉', '🍇'],
    'Flags': ['🚀', '🛸', '🌍', '🌎', '🌏', '🌐', '🗺️', '🎌', '🏁', '🏳️', '🏴', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️']
  };

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
  };

  return (
    <div className="emoji-picker">
      <div className="emoji-picker-header">
        <span>Choose an emoji</span>
        <button onClick={onClose} className="emoji-close-btn">×</button>
      </div>
      <div className="emoji-picker-content">
        {Object.entries(emojiCategories).map(([category, emojis]) => (
          <div key={category} className="emoji-category">
            <div className="emoji-category-title">{category}</div>
            <div className="emoji-grid">
              {emojis.map((emoji, index) => (
                <button
                  key={`${category}-${index}`}
                  className="emoji-btn"
                  onClick={() => handleEmojiClick(emoji)}
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;