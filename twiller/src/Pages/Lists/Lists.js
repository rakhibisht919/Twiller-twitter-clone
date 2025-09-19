import React, { useState, useEffect } from "react";
import "../pages.css";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import PeopleIcon from '@mui/icons-material/People';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import { Avatar, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Switch } from '@mui/material';

const Lists = () => {
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const [lists, setLists] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListPrivate, setNewListPrivate] = useState(false);
  const currentUserId = user?.email || user?.uid;

  useEffect(() => {
    // Load lists from localStorage or backend
    const loadLists = async () => {
      try {
        // Try to fetch from backend first
        const response = await fetch(`http://localhost:5001/lists?userId=${currentUserId}`);
        if (response.ok) {
          const data = await response.json();
          setLists(data.lists || []);
        } else {
          // Fallback to localStorage
          const savedLists = localStorage.getItem(`user_lists_${currentUserId}`);
          if (savedLists) {
            setLists(JSON.parse(savedLists));
          } else {
            // Start with empty state
            setLists([]);
          }
        }
      } catch (error) {
        console.log('Failed to load lists from backend, using localStorage:', error);
        // Fallback to localStorage
        const savedLists = localStorage.getItem(`user_lists_${currentUserId}`);
        if (savedLists) {
          setLists(JSON.parse(savedLists));
        } else {
          // Start with empty state
          setLists([]);
        }
      }
    };

    if (currentUserId) {
      loadLists();
    }
  }, [currentUserId]);

  const handleCreateList = () => {
    if (newListName.trim()) {
      const newList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        description: newListDescription.trim(),
        memberCount: 0,
        followingCount: 0,
        isPrivate: newListPrivate,
        createdAt: new Date(),
        owner: currentUserId,
        coverImage: null
      };

      const updatedLists = [newList, ...lists];
      setLists(updatedLists);
      localStorage.setItem(`user_lists_${currentUserId}`, JSON.stringify(updatedLists));

      // Reset form
      setNewListName('');
      setNewListDescription('');
      setNewListPrivate(false);
      setOpenCreateDialog(false);
    }
  };

  const handleDeleteList = (listId) => {
    if (window.confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
      const updatedLists = lists.filter(list => list.id !== listId);
      setLists(updatedLists);
      localStorage.setItem(`user_lists_${currentUserId}`, JSON.stringify(updatedLists));
    }
  };

  const formatDate = (date) => {
    const listDate = new Date(date);
    return listDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="page">
      <div className="pageHeader" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        borderBottom: '1px solid rgb(239, 243, 244)',
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        zIndex: 10
      }}>
        <ArrowBackIcon
          className="arrow-icon"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        />
        <div style={{ flex: 1 }}>
          <h2 className="pageTitle" style={{ margin: 0 }}>Lists</h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgb(83, 100, 113)' }}>
            @{user?.email?.split('@')[0] || 'user'}
          </p>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
          style={{
            backgroundColor: 'rgb(29, 155, 240)',
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: '700'
          }}
        >
          Create List
        </Button>
      </div>

      <div style={{ padding: '0' }}>
        {lists.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            color: 'rgb(83, 100, 113)'
          }}>
            <ListIcon style={{ fontSize: '64px', marginBottom: '16px', color: 'rgb(207, 217, 222)' }} />
            <h3 style={{ fontSize: '31px', fontWeight: '800', marginBottom: '8px' }}>
              Create your first List
            </h3>
            <p style={{ fontSize: '15px', lineHeight: '20px', maxWidth: '380px', margin: '0 auto 24px auto' }}>
              Lists are a great way to organize accounts by topics or interests. You can keep Lists private or share them with others.
            </p>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
              style={{
                backgroundColor: 'rgb(29, 155, 240)',
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: '700',
                padding: '12px 24px'
              }}
            >
              Create a List
            </Button>
          </div>
        ) : (
          <div>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid rgb(239, 243, 244)',
              backgroundColor: 'rgb(247, 249, 249)'
            }}>
              <p style={{
                margin: 0,
                fontSize: '15px',
                color: 'rgb(83, 100, 113)',
                textAlign: 'center'
              }}>
                <strong>{lists.length}</strong> {lists.length === 1 ? 'List' : 'Lists'} • Organize accounts by topics and interests
              </p>
            </div>
            
            {lists.map((list) => (
              <div
                key={list.id}
                style={{
                  borderBottom: '1px solid rgb(239, 243, 244)',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(247, 249, 249)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => console.log(`Open list: ${list.name}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: 'rgb(29, 155, 240)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '18px'
                    }}>
                      {list.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{
                          margin: 0,
                          fontSize: '15px',
                          fontWeight: '700',
                          color: 'rgb(15, 20, 25)'
                        }}>
                          {list.name}
                        </h3>
                        {list.isPrivate && (
                          <LockIcon style={{ fontSize: '16px', color: 'rgb(83, 100, 113)' }} />
                        )}
                      </div>
                      
                      {list.description && (
                        <p style={{
                          margin: '0 0 8px 0',
                          fontSize: '15px',
                          color: 'rgb(83, 100, 113)',
                          lineHeight: '20px'
                        }}>
                          {list.description}
                        </p>
                      )}
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        fontSize: '13px',
                        color: 'rgb(83, 100, 113)'
                      }}>
                        <span>
                          <PeopleIcon style={{ fontSize: '16px', marginRight: '4px' }} />
                          {list.memberCount} members
                        </span>
                        <span>{list.followingCount} followers</span>
                        <span>Created {formatDate(list.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                    size="small"
                    style={{ color: 'rgb(83, 100, 113)' }}
                  >
                    <MoreHorizIcon />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create List Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create a new List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="List name"
            fullWidth
            variant="outlined"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            inputProps={{ maxLength: 25 }}
            helperText={`${newListName.length}/25 characters`}
            style={{ marginBottom: '16px' }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newListDescription}
            onChange={(e) => setNewListDescription(e.target.value)}
            inputProps={{ maxLength: 100 }}
            helperText={`${newListDescription.length}/100 characters`}
            style={{ marginBottom: '16px' }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={newListPrivate}
                onChange={(e) => setNewListPrivate(e.target.checked)}
              />
            }
            label="Make this List private"
          />
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '13px',
            color: 'rgb(83, 100, 113)',
            lineHeight: '16px'
          }}>
            {newListPrivate
              ? 'Only you can see this List. Members can see that they\'ve been added to a private List.'
              : 'Anyone can see this List. Only you can add and remove people.'}
          </p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenCreateDialog(false)}
            style={{ color: 'rgb(83, 100, 113)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateList}
            variant="contained"
            disabled={!newListName.trim()}
            style={{
              backgroundColor: 'rgb(29, 155, 240)',
              borderRadius: '20px',
              textTransform: 'none'
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Lists;
