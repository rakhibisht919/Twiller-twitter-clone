import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, Card, CardContent, Typography, Avatar, Box } from '@mui/material';
import { Search, TrendingUp, People, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import "../pages.css";
import './Explore.css';

const Explore = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [trends, setTrends] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    // Fetch real trending topics from backend
    const fetchTrends = async () => {
      try {
        const response = await fetch('http://localhost:5001/trends');
        if (response.ok) {
          const data = await response.json();
          setTrends(data.trends || []);
        } else {
          setTrends([]);
        }
      } catch (error) {
        console.log('Failed to fetch trends:', error);
        setTrends([]);
      }
    };

    // Fetch real suggested users from backend
    const fetchSuggestedUsers = async () => {
      try {
        const response = await fetch('http://localhost:5001/suggested-users');
        if (response.ok) {
          const data = await response.json();
          setSuggestedUsers(data.users || []);
        } else {
          setSuggestedUsers([]);
        }
      } catch (error) {
        console.log('Failed to fetch suggested users:', error);
        setSuggestedUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
    fetchSuggestedUsers();
  }, []);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      try {
        const response = await fetch(`http://localhost:5001/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.results || []);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.log('Search failed:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="page">
      <div className="pageHeader" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderBottom: '1px solid rgb(239, 243, 244)',
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ArrowBack
            className="arrow-icon"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
          <div>
            <h2 className="pageTitle" style={{ margin: 0 }}>Explore</h2>
          </div>
        </div>
      </div>
      
      <div style={{ padding: '16px' }}>
        <TextField
          fullWidth
          placeholder="Search Twiller"
          value={searchQuery}
          onChange={handleSearch}
          variant="outlined"
          style={{ marginBottom: '16px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </div>

      <div style={{ padding: '0 16px' }}>
        {searchQuery ? (
          /* Search Results */
          <Card style={{ marginBottom: '16px' }}>
            <CardContent>
              <Typography variant="h6" style={{ marginBottom: '16px' }}>
                Search Results for "{searchQuery}"
              </Typography>
              {searchResults.length === 0 ? (
                <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', padding: '20px' }}>
                  No results found for "{searchQuery}"
                </Typography>
              ) : (
                searchResults.map((result, index) => (
                  <div key={index} style={{ padding: '12px 0', borderBottom: '1px solid rgb(239, 243, 244)' }}>
                    <Typography variant="body1">{result.content}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      @{result.username} • {result.type}
                    </Typography>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : (
          <div>
            {/* Trending Section */}
            <Card style={{ marginBottom: '16px' }}>
              <CardContent>
                <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <TrendingUp /> What's happening
                </Typography>
                {loading ? (
                  <Typography variant="body2" style={{ textAlign: 'center', padding: '20px' }}>
                    Loading trends...
                  </Typography>
                ) : trends.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', padding: '20px' }}>
                    No trending topics available right now
                  </Typography>
                ) : (
                  trends.map((trend, index) => (
                    <div key={index} style={{ padding: '12px 0', borderBottom: index < trends.length - 1 ? '1px solid rgb(239, 243, 244)' : 'none' }}>
                      <Typography variant="body1" style={{ fontWeight: '700' }}>
                        {trend.topic}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {trend.tweets} Tweets
                      </Typography>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Suggested Users Section */}
            <Card>
              <CardContent>
                <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <People /> Who to follow
                </Typography>
                {loading ? (
                  <Typography variant="body2" style={{ textAlign: 'center', padding: '20px' }}>
                    Loading suggestions...
                  </Typography>
                ) : suggestedUsers.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', padding: '20px' }}>
                    No user suggestions available right now
                  </Typography>
                ) : (
                  suggestedUsers.map((user) => (
                    <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid rgb(239, 243, 244)' }}>
                      <Avatar src={user.avatar}>
                        {user.name?.charAt(0)}
                      </Avatar>
                      <Box style={{ flex: 1 }}>
                        <Typography variant="body1" style={{ fontWeight: '700' }}>
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          @{user.username}
                        </Typography>
                        {user.followers && (
                          <Typography variant="caption" color="textSecondary" style={{ display: 'block' }}>
                            {user.followers} followers
                          </Typography>
                        )}
                      </Box>
                      <button style={{
                        backgroundColor: 'rgb(29, 155, 240)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '6px 16px',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}>
                        Follow
                      </button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;