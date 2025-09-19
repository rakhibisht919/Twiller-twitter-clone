import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Description as TermsIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import '../pages.css';
import './More.css';

const More = () => {
  const navigate = useNavigate();
  
  const menuItems = [
    {
      icon: <SettingsIcon />,
      text: 'Settings and privacy',
      description: 'Manage your account',
      onClick: () => navigate('/settings')
    },
    {
      icon: <TermsIcon />,
      text: 'Terms of Service',
      description: 'Review our terms',
      onClick: () => navigate('/terms')
    }
  ];

  return (
    <div className="more-page">
      <Box className="more-header">
        <IconButton 
          onClick={() => navigate('/')} 
          className="back-button"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" className="more-title">
          More
        </Typography>
      </Box>
      
      <div className="more-content">
        <List className="more-menu">
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem 
                button 
                onClick={item.onClick}
                className="more-menu-item"
              >
                <ListItemIcon className="more-menu-icon">
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography className="more-menu-text">
                      {item.text}
                    </Typography>
                  }
                  secondary={
                    <Typography className="more-menu-description">
                      {item.description}
                    </Typography>
                  }
                />
              </ListItem>
              {index < menuItems.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </div>
    </div>
  );
};

export default More;