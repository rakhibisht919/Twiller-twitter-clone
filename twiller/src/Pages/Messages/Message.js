import React, { useState, useEffect } from "react";
import '../pages.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreateIcon from '@mui/icons-material/Create';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import MessageIcon from '@mui/icons-material/Message';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import { Avatar, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';

const Message = () => {
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const [openWriteMessage, setOpenWriteMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [conversations, setConversations] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch users that current user is following
  useEffect(() => {
    const fetchFollowingUsers = async () => {
      if (!user?.email) return;
      
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/following-users?email=${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Transform the data to match our component's expected format
            const transformedUsers = data.users.map(u => ({
              id: u._id || u.email,
              name: u.name || u.displayName || u.email.split('@')[0],
              username: u.username || u.email.split('@')[0],
              email: u.email,
              profileImage: u.profileImage || null,
              following: true // They are following since we got them from following-users endpoint
            }));
            setFollowingUsers(transformedUsers);
            setFilteredUsers(transformedUsers);
          } else {
            console.error('Failed to fetch following users:', data.error);
            setFollowingUsers([]);
            setFilteredUsers([]);
          }
        } else {
          console.error('Failed to fetch following users');
          setFollowingUsers([]);
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error('Error fetching following users:', error);
        setFollowingUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingUsers();
  }, [user?.email]);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = followingUsers.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(followingUsers);
    }
  }, [searchQuery, followingUsers]);

  const handleSendMessage = async () => {
    if (selectedUser && messageText.trim()) {
      try {
        const response = await fetch('http://localhost:5001/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: user?.email,
            to: selectedUser.email,
            message: messageText.trim(),
            timestamp: new Date().toISOString()
          })
        });

        if (response.ok) {
          alert(`Message sent to ${selectedUser.name}!`);
        } else {
          // Fallback: Save to localStorage for future implementation
          const messages = JSON.parse(localStorage.getItem(`messages_${user?.email}`) || '[]');
          const newMessage = {
            id: Date.now().toString(),
            from: user?.email,
            to: selectedUser.email,
            toName: selectedUser.name,
            message: messageText.trim(),
            timestamp: new Date().toISOString(),
            read: false
          };
          messages.push(newMessage);
          localStorage.setItem(`messages_${user?.email}`, JSON.stringify(messages));
          alert(`Message sent to ${selectedUser.name}! (Saved locally)`);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        // Fallback: Save to localStorage
        const messages = JSON.parse(localStorage.getItem(`messages_${user?.email}`) || '[]');
        const newMessage = {
          id: Date.now().toString(),
          from: user?.email,
          to: selectedUser.email,
          toName: selectedUser.name,
          message: messageText.trim(),
          timestamp: new Date().toISOString(),
          read: false
        };
        messages.push(newMessage);
        localStorage.setItem(`messages_${user?.email}`, JSON.stringify(messages));
        alert(`Message sent to ${selectedUser.name}! (Saved locally)`);
      }
      
      // Reset form
      setMessageText('');
      setSelectedUser(null);
      setSearchQuery('');
      setOpenWriteMessage(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="page">
      {/* Header */}
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
          <ArrowBackIcon
            className="arrow-icon"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
          <div>
            <h2 className="pageTitle" style={{ margin: 0 }}>Messages</h2>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div style={{
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>

        {/* Welcome Content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 200px)',
          textAlign: 'center',
          padding: '40px 20px'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '800',
            marginBottom: '16px',
            color: 'rgb(15, 20, 25)',
            lineHeight: '1.2'
          }}>
            Welcome to your inbox!
          </h2>
          
          <p style={{
            fontSize: '15px',
            lineHeight: '20px',
            color: 'rgb(83, 100, 113)',
            marginBottom: '32px',
            maxWidth: '400px'
          }}>
            Drop a line, share posts and more with private conversations between you and others on Twiller.
          </p>
          
          <Button
            variant="contained"
            onClick={() => setOpenWriteMessage(true)}
            style={{
              backgroundColor: 'rgb(29, 155, 240)',
              borderRadius: '24px',
              textTransform: 'none',
              fontWeight: '700',
              padding: '12px 24px',
              fontSize: '15px',
              color: 'white'
            }}
          >
            Write a message
          </Button>
        </div>
      </div>

      {/* Write Message Dialog */}
      <Dialog
        open={openWriteMessage}
        onClose={() => {
          setOpenWriteMessage(false);
          setSelectedUser(null);
          setSearchQuery('');
          setMessageText('');
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '16px',
            maxHeight: '80vh',
            backgroundColor: 'white',
            color: 'rgb(15, 20, 25)'
          }
        }}
      >
        <DialogTitle style={{
          borderBottom: '1px solid rgb(239, 243, 244)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'white',
          color: 'rgb(15, 20, 25)'
        }}>
          <span style={{ fontWeight: '700', fontSize: '20px', color: 'rgb(15, 20, 25)' }}>New message</span>
          <IconButton
            onClick={() => setOpenWriteMessage(false)}
            size="small"
            style={{ color: 'rgb(83, 100, 113)' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent style={{ padding: 0 }}>
          {!selectedUser ? (
            <div>
              {/* Search Bar */}
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid rgb(239, 243, 244)',
                backgroundColor: 'white'
              }}>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <SearchIcon style={{
                    position: 'absolute',
                    left: '16px',
                    color: 'rgb(83, 100, 113)',
                    fontSize: '20px',
                    zIndex: 1
                  }} />
                  <TextField
                    fullWidth
                    placeholder="Search people you follow"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      style: {
                        paddingLeft: '48px',
                        backgroundColor: 'rgb(247, 249, 249)',
                        borderRadius: '24px',
                        color: 'rgb(15, 20, 25)'
                      }
                    }}
                    inputProps={{
                      style: {
                        color: 'rgb(15, 20, 25)'
                      }
                    }}
                  />
                </div>
              </div>
              
              {/* User List */}
              <div style={{ maxHeight: '300px', overflowY: 'auto', backgroundColor: 'white' }}>
                {loading ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 24px',
                    color: 'rgb(83, 100, 113)'
                  }}>
                    <p style={{ margin: 0 }}>Loading users...</p>
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <List style={{ padding: 0, backgroundColor: 'white' }}>
                    {filteredUsers.map((user) => (
                      <ListItem
                        key={user.id}
                        button
                        onClick={() => handleUserSelect(user)}
                        style={{
                          padding: '12px 24px',
                          borderBottom: '1px solid rgb(239, 243, 244)',
                          backgroundColor: 'white',
                          '&:hover': {
                            backgroundColor: 'rgb(247, 249, 249)'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={user.profileImage}
                            alt={user.name}
                            style={{ width: 40, height: 40 }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: '700', color: 'rgb(15, 20, 25)' }}>
                                {user.name}
                              </span>
                              {user.following && (
                                <span style={{
                                  fontSize: '12px',
                                  color: 'rgb(83, 100, 113)',
                                  backgroundColor: 'rgb(247, 249, 249)',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}>
                                  Following
                                </span>
                              )}
                            </div>
                          }
                          secondary={
                            <span style={{ color: 'rgb(83, 100, 113)' }}>
                              @{user.username}
                            </span>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 24px',
                    color: 'rgb(83, 100, 113)',
                    backgroundColor: 'white'
                  }}>
                    <p style={{ margin: 0 }}>
                      {searchQuery 
                        ? 'No users found matching your search.' 
                        : followingUsers.length === 0
                          ? 'You are not following anyone yet. Start following people to send them messages!'
                          : 'No users found.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Message Composition */
            <div style={{ padding: '24px', backgroundColor: 'white' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: 'rgb(247, 249, 249)',
                borderRadius: '8px'
              }}>
                <Avatar
                  src={selectedUser.profileImage}
                  alt={selectedUser.name}
                  style={{ width: 32, height: 32 }}
                >
                  {selectedUser.name.charAt(0)}
                </Avatar>
                <div>
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: 'rgb(15, 20, 25)' }}>
                    {selectedUser.name}
                  </p>
                  <p style={{ margin: 0, color: 'rgb(83, 100, 113)', fontSize: '13px' }}>
                    @{selectedUser.username}
                  </p>
                </div>
                <IconButton
                  onClick={() => setSelectedUser(null)}
                  size="small"
                  style={{ marginLeft: 'auto', color: 'rgb(83, 100, 113)' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Start a conversation..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                variant="outlined"
                inputProps={{ maxLength: 1000, style: { color: 'rgb(15, 20, 25)' } }}
                InputProps={{
                  style: {
                    backgroundColor: 'white',
                    color: 'rgb(15, 20, 25)',
                    border: '1px solid rgb(207, 217, 222)'
                  }
                }}
                helperText={`${messageText.length}/1000 characters`}
                FormHelperTextProps={{
                  style: { color: 'rgb(83, 100, 113)' }
                }}
              />
            </div>
          )}
        </DialogContent>
        
        {selectedUser && (
          <DialogActions style={{
            padding: '16px 24px',
            borderTop: '1px solid rgb(239, 243, 244)',
            backgroundColor: 'white'
          }}>
            <Button
              onClick={() => setSelectedUser(null)}
              style={{ color: 'rgb(83, 100, 113)' }}
            >
              Back
            </Button>
            <Button
              onClick={handleSendMessage}
              variant="contained"
              disabled={!messageText.trim()}
              endIcon={<SendIcon />}
              style={{
                backgroundColor: 'rgb(29, 155, 240)',
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: '700',
                color: 'white'
              }}
            >
              Send
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
};

export default Message;
