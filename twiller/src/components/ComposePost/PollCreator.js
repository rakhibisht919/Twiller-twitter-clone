import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import './PollCreator.css';

const PollCreator = ({ pollOptions, setPollOptions, pollDuration, setPollDuration, onClose }) => {
  const [localOptions, setLocalOptions] = useState(pollOptions);

  const handleOptionChange = (index, value) => {
    const newOptions = [...localOptions];
    newOptions[index] = value;
    setLocalOptions(newOptions);
    setPollOptions(newOptions);
  };

  const addOption = () => {
    if (localOptions.length < 4) {
      const newOptions = [...localOptions, ''];
      setLocalOptions(newOptions);
      setPollOptions(newOptions);
    }
  };

  const removeOption = (index) => {
    if (localOptions.length > 2) {
      const newOptions = localOptions.filter((_, i) => i !== index);
      setLocalOptions(newOptions);
      setPollOptions(newOptions);
    }
  };

  const durationOptions = [
    '5 minutes',
    '30 minutes',
    '1 hour',
    '6 hours',
    '12 hours',
    '1 day',
    '3 days',
    '7 days'
  ];

  return (
    <div className="poll-creator">
      <div className="poll-creator-header">
        <span>Create a poll</span>
        <button onClick={onClose} className="poll-close-btn">
          <CloseIcon fontSize="small" />
        </button>
      </div>
      
      <div className="poll-options">
        {localOptions.map((option, index) => (
          <div key={index} className="poll-option">
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Choice ${index + 1}`}
              className="poll-option-input"
              maxLength={100}
            />
            {localOptions.length > 2 && (
              <button
                onClick={() => removeOption(index)}
                className="remove-option-btn"
                title="Remove option"
              >
                <CloseIcon fontSize="small" />
              </button>
            )}
          </div>
        ))}
        
        {localOptions.length < 4 && (
          <button onClick={addOption} className="add-option-btn">
            <AddIcon fontSize="small" />
            <span>Add a choice</span>
          </button>
        )}
      </div>
      
      <div className="poll-settings">
        <div className="poll-duration">
          <label>Poll length</label>
          <select
            value={pollDuration}
            onChange={(e) => setPollDuration(e.target.value)}
            className="duration-select"
          >
            {durationOptions.map(duration => (
              <option key={duration} value={duration}>{duration}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default PollCreator;