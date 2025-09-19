import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import './Topics.css';

const Topics = () => {
  const navigate = useNavigate();
  const [followedTopics, setFollowedTopics] = useState([]);

  const trendingTopics = [
    { name: 'Technology', tweetCount: '125K', category: 'Tech' },
    { name: 'Sports', tweetCount: '89K', category: 'Sports' },
    { name: 'Entertainment', tweetCount: '67K', category: 'Entertainment' },
    { name: 'Politics', tweetCount: '156K', category: 'News' },
    { name: 'Science', tweetCount: '45K', category: 'Education' },
    { name: 'Music', tweetCount: '78K', category: 'Entertainment' },
    { name: 'Gaming', tweetCount: '92K', category: 'Gaming' },
    { name: 'Food', tweetCount: '34K', category: 'Lifestyle' }
  ];

  const handleFollowTopic = (topicName) => {
    if (followedTopics.includes(topicName)) {
      setFollowedTopics(followedTopics.filter(topic => topic !== topicName));
    } else {
      setFollowedTopics([...followedTopics, topicName]);
    }
  };

  return (
    <div className="topics-page">
      <Box className="topics-header">
        <IconButton 
          onClick={() => navigate('/more')} 
          className="back-button"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" className="topics-title">
          Topics
        </Typography>
      </Box>
      
      <div className="topics-content">
        <Box className="topics-description">
          <Typography className="topics-subtitle">
            Follow topics to discover new Tweets
          </Typography>
          <Typography className="topics-info">
            When you follow a topic, you'll see Tweets about it in your timeline.
          </Typography>
        </Box>

        <Box className="trending-section">
          <Typography variant="h6" className="section-title">
            <TrendingIcon className="trending-icon" />
            Trending Topics
          </Typography>
          
          <Grid container spacing={2} className="topics-grid">
            {trendingTopics.map((topic, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card className="topic-card">
                  <CardContent className="topic-card-content">
                    <Typography className="topic-category">
                      {topic.category}
                    </Typography>
                    <Typography className="topic-name">
                      {topic.name}
                    </Typography>
                    <Typography className="topic-count">
                      {topic.tweetCount} Tweets
                    </Typography>
                    <Chip
                      label={followedTopics.includes(topic.name) ? 'Following' : 'Follow'}
                      onClick={() => handleFollowTopic(topic.name)}
                      className={`follow-chip ${followedTopics.includes(topic.name) ? 'following' : ''}`}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </div>
    </div>
  );
};

export default Topics;
