import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, TextField, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import './UsernameSelection.css';

const UsernameSelection = ({ open, onClose, onUsernameSelect, userDisplayName, userEmail }) => {
  const [selectedUsername, setSelectedUsername] = useState('');
  const [customUsername, setCustomUsername] = useState('');
  const [suggestedUsernames, setSuggestedUsernames] = useState([]);
  const [isCustom, setIsCustom] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);

  // Generate random username suggestions
  const generateUsernameSuggestions = () => {
    const baseName = userDisplayName?.toLowerCase().replace(/\s+/g, '') || 
                     userEmail?.split('@')[0] || 'user';
    
    const adjectives = ['cool', 'smart', 'quick', 'bright', 'swift', 'bold', 'wise', 'keen'];
    const suffixes = ['123', '456', '789', '2024', '99', '007', 'x', 'pro'];
    
    const suggestions = [];
    
    // Suggestion 1: Base name + random number
    suggestions.push(`${baseName}${Math.floor(Math.random() * 9999)}`);
    
    // Suggestion 2: Adjective + base name
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    suggestions.push(`${randomAdjective}${baseName}`);
    
    // Suggestion 3: Base name + suffix
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    suggestions.push(`${baseName}${randomSuffix}`);
    
    return suggestions;
  };

  useEffect(() => {
    if (open) {
      const suggestions = generateUsernameSuggestions();
      setSuggestedUsernames(suggestions);
      setSelectedUsername(suggestions[0]); // Pre-select first suggestion
    }
  }, [open, userDisplayName, userEmail]);

  // Check username availability (mock function - replace with actual API call)
  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setIsAvailable(false);
      return;
    }

    setIsChecking(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock availability check - in real app, call your backend
      const unavailableUsernames = ['admin', 'root', 'test', 'user', 'twitter'];
      const available = !unavailableUsernames.includes(username.toLowerCase());
      setIsAvailable(available);
      setIsChecking(false);
    }, 500);
  };

  useEffect(() => {
    if (customUsername) {
      checkUsernameAvailability(customUsername);
    } else {
      setIsAvailable(null);
    }
  }, [customUsername]);

  const handleUsernameSelect = (username) => {
    setSelectedUsername(username);
    setIsCustom(false);
    setCustomUsername('');
  };

  const handleCustomUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setCustomUsername(value);
    setSelectedUsername(value);
    setIsCustom(true);
  };

  const handleNext = () => {
    const finalUsername = isCustom ? customUsername : selectedUsername;
    if (finalUsername && (!isCustom || isAvailable)) {
      onUsernameSelect(finalUsername);
      onClose();
    }
  };

  const handleSkip = () => {
    // Generate random username and proceed
    const randomUsername = `user${Math.floor(Math.random() * 999999)}`;
    onUsernameSelect(randomUsername);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="username-selection-modal"
      className="username-modal"
    >
      <Box className="username-modal-content">
        <div className="username-modal-header">
          <IconButton onClick={onClose} className="close-btn">
            <CloseIcon />
          </IconButton>
        </div>

        <div className="username-modal-body">
          <div className="twitter-logo">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>

          <h1 className="username-modal-title">What should we call you?</h1>
          <p className="username-modal-subtitle">
            Your @username is unique. You can always change it later.
          </p>

          <div className="username-suggestions">
            {suggestedUsernames.map((username, index) => (
              <div
                key={index}
                className={`username-suggestion ${selectedUsername === username && !isCustom ? 'selected' : ''}`}
                onClick={() => handleUsernameSelect(username)}
              >
                <div className="username-info">
                  <span className="username-text">@{username}</span>
                  {selectedUsername === username && !isCustom && (
                    <CheckIcon className="check-icon" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="custom-username-section">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Choose your own username"
              value={customUsername}
              onChange={handleCustomUsernameChange}
              className="custom-username-input"
              InputProps={{
                startAdornment: <span className="username-prefix">@</span>,
              }}
              helperText={
                isCustom && customUsername ? (
                  isChecking ? 'Checking availability...' :
                  isAvailable === true ? '✓ Username is available' :
                  isAvailable === false ? '✗ Username is not available' : ''
                ) : 'Username can only contain letters, numbers, and underscores'
              }
              error={isCustom && isAvailable === false}
            />
          </div>

          <div className="username-modal-actions">
            <Button
              variant="text"
              onClick={handleSkip}
              className="skip-btn"
            >
              Skip for now
            </Button>
            
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!selectedUsername || (isCustom && !isAvailable)}
              className="next-btn"
            >
              Next
            </Button>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default UsernameSelection;
