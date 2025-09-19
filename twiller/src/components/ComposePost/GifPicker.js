import React, { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import './GifPicker.css';

const GifPicker = ({ onGifSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock GIF data - in a real app, you'd use GIPHY API
  const mockGifs = [
    {
      id: '1',
      url: 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
      title: 'Happy Cat'
    },
    {
      id: '2', 
      url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
      title: 'Dancing'
    },
    {
      id: '3',
      url: 'https://media.giphy.com/media/26AHPxxnSw1L9T1rW/giphy.gif',
      title: 'Thumbs Up'
    },
    {
      id: '4',
      url: 'https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif',
      title: 'Celebration'
    },
    {
      id: '5',
      url: 'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif',
      title: 'Excited'
    },
    {
      id: '6',
      url: 'https://media.giphy.com/media/3o6ZtpvPW6fqxkE1xu/giphy.gif',
      title: 'Laughing'
    },
    {
      id: '7',
      url: 'https://media.giphy.com/media/l0MYzLLxlJDfYtzy0/giphy.gif',
      title: 'Love'
    },
    {
      id: '8',
      url: 'https://media.giphy.com/media/3o6ZsVl2hv8ZnhOXQs/giphy.gif',
      title: 'Surprised'
    }
  ];

  useEffect(() => {
    // Load trending GIFs on mount
    setLoading(true);
    setTimeout(() => {
      setGifs(mockGifs);
      setLoading(false);
    }, 500);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock search - filter by title
    setTimeout(() => {
      const filteredGifs = searchTerm 
        ? mockGifs.filter(gif => 
            gif.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : mockGifs;
      setGifs(filteredGifs);
      setLoading(false);
    }, 300);
  };

  const handleGifClick = (gif) => {
    onGifSelect(gif);
    onClose();
  };

  return (
    <div className="gif-picker">
      <div className="gif-picker-header">
        <form onSubmit={handleSearch} className="gif-search-form">
          <div className="gif-search-container">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search GIFs"
              className="gif-search-input"
            />
          </div>
        </form>
        <button onClick={onClose} className="gif-close-btn">
          <CloseIcon />
        </button>
      </div>
      
      <div className="gif-picker-content">
        {loading ? (
          <div className="gif-loading">
            <div className="loading-spinner"></div>
            <span>Loading GIFs...</span>
          </div>
        ) : gifs.length > 0 ? (
          <div className="gif-grid">
            {gifs.map(gif => (
              <div
                key={gif.id}
                className="gif-item"
                onClick={() => handleGifClick(gif)}
              >
                <img 
                  src={gif.url} 
                  alt={gif.title}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="no-gifs">
            <span>No GIFs found</span>
            <p>Try searching for something else</p>
          </div>
        )}
      </div>
      
      <div className="gif-picker-footer">
        <span className="powered-by">Search powered by GIPHY</span>
      </div>
    </div>
  );
};

export default GifPicker;