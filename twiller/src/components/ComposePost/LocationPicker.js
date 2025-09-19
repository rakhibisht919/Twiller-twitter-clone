import React, { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import './LocationPicker.css';

const LocationPicker = ({ onLocationSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Mock location data - in a real app, you'd use a maps API
  const mockLocations = [
    {
      id: '1',
      name: 'Times Square, New York',
      address: 'Manhattan, NY, USA',
      coordinates: { lat: 40.7580, lng: -73.9855 }
    },
    {
      id: '2', 
      name: 'Central Park',
      address: 'New York, NY, USA',
      coordinates: { lat: 40.7829, lng: -73.9654 }
    },
    {
      id: '3',
      name: 'Brooklyn Bridge',
      address: 'New York, NY, USA',
      coordinates: { lat: 40.7061, lng: -73.9969 }
    },
    {
      id: '4',
      name: 'Statue of Liberty',
      address: 'Liberty Island, NY, USA',
      coordinates: { lat: 40.6892, lng: -74.0445 }
    },
    {
      id: '5',
      name: 'Empire State Building',
      address: 'New York, NY, USA',
      coordinates: { lat: 40.7484, lng: -73.9857 }
    }
  ];

  useEffect(() => {
    // Load popular locations on mount
    setLocations(mockLocations.slice(0, 3));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock search - filter by name or address
    setTimeout(() => {
      const filteredLocations = searchTerm 
        ? mockLocations.filter(location => 
            location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.address.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : mockLocations.slice(0, 3);
      setLocations(filteredLocations);
      setLoading(false);
    }, 300);
  };

  const getCurrentLocation = () => {
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            id: 'current',
            name: 'Current Location',
            address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          };
          setCurrentLocation(location);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
          alert('Unable to get your current location. Please enable location services.');
        }
      );
    } else {
      setLoading(false);
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleLocationClick = (location) => {
    onLocationSelect(location);
    onClose();
  };

  return (
    <div className="location-picker">
      <div className="location-picker-header">
        <form onSubmit={handleSearch} className="location-search-form">
          <div className="location-search-container">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search locations"
              className="location-search-input"
            />
          </div>
        </form>
        <button onClick={onClose} className="location-close-btn">
          <CloseIcon />
        </button>
      </div>
      
      <div className="location-picker-content">
        <button 
          onClick={getCurrentLocation}
          className="current-location-btn"
          disabled={loading}
        >
          <MyLocationIcon className="location-icon" />
          <div className="location-info">
            <span className="location-name">Use current location</span>
            <span className="location-address">Get your precise location</span>
          </div>
        </button>

        {currentLocation && (
          <div 
            className="location-item current-location"
            onClick={() => handleLocationClick(currentLocation)}
          >
            <LocationOnIcon className="location-icon current" />
            <div className="location-info">
              <span className="location-name">{currentLocation.name}</span>
              <span className="location-address">{currentLocation.address}</span>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="location-loading">
            <div className="loading-spinner"></div>
            <span>Loading locations...</span>
          </div>
        ) : locations.length > 0 ? (
          <div className="location-list">
            {locations.map(location => (
              <div
                key={location.id}
                className="location-item"
                onClick={() => handleLocationClick(location)}
              >
                <LocationOnIcon className="location-icon" />
                <div className="location-info">
                  <span className="location-name">{location.name}</span>
                  <span className="location-address">{location.address}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-locations">
            <span>No locations found</span>
            <p>Try searching for a different place</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;