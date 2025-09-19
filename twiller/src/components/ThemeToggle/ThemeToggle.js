import React from 'react';
import { IconButton } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <IconButton 
      onClick={toggleTheme} 
      className="theme-toggle"
      aria-label="Toggle theme"
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? <LightMode /> : <DarkMode />}
    </IconButton>
  );
};

export default ThemeToggle;
