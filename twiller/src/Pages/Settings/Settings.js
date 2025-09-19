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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Block as BlockedIcon,
  Delete as DeleteIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useUserAuth } from '../../context/UserAuthContext';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logOut, deleteAccount } = useUserAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [deleteStep, setDeleteStep] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

  const settingsItems = [
    {
      icon: <BlockedIcon />,
      text: 'Blocked accounts',
      description: 'Manage blocked accounts',
      onClick: () => navigate('/settings/blocked')
    }
  ];

  const dangerousActions = [
    {
      icon: <DeleteIcon />,
      text: 'Delete your account',
      description: 'Permanently delete your Twiller account',
      onClick: () => setDeleteDialogOpen(true),
      danger: true
    }
  ];

  const handleDeleteAccount = async () => {
    if (deleteStep === 1) {
      setDeleteStep(2);
      return;
    }

    if (confirmationText !== 'DELETE') {
      return;
    }

    setIsDeleting(true);

    try {
      // Try to delete from server first to remove all user data
      try {
        const response = await fetch(`http://localhost:5001/deleteuser/${user?.email}`, {
          method: 'DELETE',
          headers: {
            'content-type': 'application/json',
          }
        });
        
        if (!response.ok) {
          console.error('Server deletion failed:', await response.text());
        }
      } catch (serverError) {
        console.log('Server unavailable, proceeding with Firebase deletion only');
      }

      // Delete the Firebase user account
      try {
        await deleteAccount();
      } catch (firebaseError) {
        console.error('Firebase deletion error:', firebaseError);
        // Continue with cleanup even if Firebase deletion fails
      }

      // Clear all local storage
      localStorage.removeItem('twiller_user_profile');
      localStorage.removeItem('twiller_bookmarks');
      localStorage.removeItem('twiller_theme');
      localStorage.clear(); // Clear any other potential items

      // Sign out from Firebase
      await logOut();

      // Navigate to login
      navigate('/login');

    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteStep(1);
    setConfirmationText('');
  };

  return (
    <div className="settings-page">
      <Box className="settings-header">
        <IconButton 
          onClick={() => navigate('/')} 
          className="back-button"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" className="settings-title">
          Settings and privacy
        </Typography>
      </Box>
      
      <div className="settings-content">
        <List className="settings-menu">
          {settingsItems.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem 
                button 
                onClick={item.onClick}
                className="settings-menu-item"
              >
                <ListItemIcon className="settings-menu-icon">
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography className="settings-menu-text">
                      {item.text}
                    </Typography>
                  }
                  secondary={
                    <Typography className="settings-menu-description">
                      {item.description}
                    </Typography>
                  }
                />
                <ChevronRightIcon className="settings-chevron" />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>

        <div className="dangerous-actions-section">
          <Typography variant="h6" className="section-title">
            Dangerous Actions
          </Typography>
          <List className="settings-menu">
            {dangerousActions.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem 
                  button 
                  onClick={item.onClick}
                  className={`settings-menu-item ${item.danger ? 'danger-item' : ''}`}
                >
                  <ListItemIcon className={`settings-menu-icon ${item.danger ? 'danger-icon' : ''}`}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography className={`settings-menu-text ${item.danger ? 'danger-text' : ''}`}>
                        {item.text}
                      </Typography>
                    }
                    secondary={
                      <Typography className="settings-menu-description">
                        {item.description}
                      </Typography>
                    }
                  />
                  <ChevronRightIcon className="settings-chevron" />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        className="delete-dialog"
      >
        <DialogTitle className="delete-dialog-title">
          {deleteStep === 1 ? 'Delete your account?' : 'Confirm account deletion'}
        </DialogTitle>
        
        <DialogContent className="delete-dialog-content">
          {deleteStep === 1 ? (
            <div>
              <Alert severity="warning" className="delete-warning">
                This action cannot be undone. Your account will be permanently deleted.
              </Alert>
              <Typography className="delete-info">
                When you delete your account:
              </Typography>
              <ul className="delete-consequences">
                <li>All your tweets will be permanently removed</li>
                <li>Your profile and account data will be deleted</li>
                <li>You won't be able to recover your account</li>
                <li>Your username will become available for others to use</li>
              </ul>
            </div>
          ) : (
            <div>
              <Typography className="delete-confirmation-text">
                To confirm deletion, type <strong>DELETE</strong> in the box below:
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="delete-confirmation-input"
                autoFocus
              />
            </div>
          )}
        </DialogContent>
        
        <DialogActions className="delete-dialog-actions">
          <Button 
            onClick={handleCloseDeleteDialog}
            className="cancel-button"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount}
            className="delete-button"
            disabled={deleteStep === 2 && confirmationText !== 'DELETE'}
            variant="contained"
          >
            {isDeleting ? 'Deleting...' : deleteStep === 1 ? 'Continue' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Settings;
