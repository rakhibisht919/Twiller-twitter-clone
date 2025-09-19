import React, { useState, useEffect } from "react";
import Post from "../Posts/posts";
import { useNavigate } from "react-router-dom";
import "./Mainprofile.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CenterFocusWeakIcon from "@mui/icons-material/CenterFocusWeak";
import LockResetIcon from "@mui/icons-material/LockReset";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import AddLinkIcon from "@mui/icons-material/AddLink";
import Editprofile from "../Editprofile/Editprofile";
import axios from "axios";
import useLoggedinuser from "../../../hooks/useLoggedinuser";
import NotificationToggle from "../../../components/NotificationToggle/NotificationToggle";
import LoginHistory from "../../../components/LoginHistory/LoginHistory";
import { uploadImage } from "../../../utils/imageUtils";
import { showSuccess, showError, showWarning } from "../../../utils/notifications";
const Mainprofile = ({ user }) => {
  const navigate = useNavigate();
  const [isloading, setisloading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [loggedinuser] = useLoggedinuser();
  const username = user?.email?.split("@")[0];
  const [post, setpost] = useState([]);
  
  // Create demo login history if none exists
  const createDemoLoginHistory = async () => {
    if (!user?.email) return;
    
    try {
      // Check if user has any login history
      const response = await fetch(`http://localhost:5001/login-history?email=${encodeURIComponent(user.email)}&limit=1`);
      const data = await response.json();
      
      if (data.success && data.history.length === 0) {
        // Create demo login entries
        const demoLogins = [
          {
            email: user.email,
            deviceInfo: {
              browser: 'Chrome',
              os: 'Windows',
              deviceType: 'Desktop',
              ipAddress: '192.168.1.100',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              language: navigator.language
            },
            loginSuccess: true,
            authMethod: 'password'
          },
          {
            email: user.email,
            deviceInfo: {
              browser: 'Edge',
              os: 'Windows',
              deviceType: 'Desktop',
              ipAddress: '192.168.1.100',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              language: navigator.language
            },
            loginSuccess: true,
            authMethod: 'password'
          }
        ];
        
        // Create demo entries
        for (const login of demoLogins) {
          await fetch('http://localhost:5001/track-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(login)
          });
        }
      }
    } catch (error) {
      console.log('Could not create demo login history:', error);
    }
  };

  useEffect(() => {
    // Try to fetch from server, fallback to mock data if server unavailable
    fetch(`http://localhost:5001/posts-by-email?email=${user?.email}`)
      .then((res) => {
        if (!res.ok) throw new Error('Server unavailable');
        return res.json();
      })
      .then((data) => {
        setpost(data);
      })
      .catch((error) => {
        console.error('Failed to fetch user posts:', error.message);
        setpost([]);
      });
      
    // Create demo login history if needed
    createDemoLoginHistory();
  }, [user.email, user.displayName, user.photoURL]);

  const handleuploadcoverimage = async (e) => {
    const image = e.target.files[0];
    
    console.log('Cover image upload started');
    console.log('Selected file:', image ? {
      name: image.name,
      size: image.size,
      type: image.type
    } : 'No file selected');
    
    if (!image) return;
    
    setisloading(true);
    setUploadStatus('Uploading cover image...');
    
    try {
      // Use the improved upload utility
      const imageUrl = await uploadImage(image, (status) => {
        setUploadStatus(status);
      });
      
      if (imageUrl) {
        const usercoverimage = {
          email: user?.email,
          coverimage: imageUrl,
        };
        
        try {
          setUploadStatus('Saving to server...');
          console.log('Attempting to update cover image for:', user?.email);
          
          const updateResponse = await fetch(`http://localhost:5001/userupdate?email=${encodeURIComponent(user?.email)}`, {
            method: 'PATCH',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify(usercoverimage),
          });
          
          const responseData = await updateResponse.json();
          console.log('Server response:', responseData);
          
          if (updateResponse.ok && responseData.success) {
            setUploadStatus('');
            showSuccess('Cover image updated successfully!');
            
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            console.error('Server error:', responseData);
            throw new Error(responseData.message || responseData.error || 'Server update failed');
          }
        } catch (serverError) {
          console.error('Cover image update error:', serverError);
          // Fallback: Save to localStorage when server is unavailable
          const userProfile = JSON.parse(localStorage.getItem('twiller_user_profile') || '{}');
          userProfile.coverimage = imageUrl;
          userProfile.email = user?.email;
          localStorage.setItem('twiller_user_profile', JSON.stringify(userProfile));
          
          window.dispatchEvent(new Event('storage'));
          
          showWarning('Cover image updated successfully! (Saved locally)');
          
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Cover image upload error:', error);
      showError(error.message || 'Failed to upload cover image');
    } finally {
      setisloading(false);
      setUploadStatus('');
      e.target.value = '';
    }
  };
  const handleuploadprofileimage = async (e) => {
    const image = e.target.files[0];
    
    console.log('Profile image upload started');
    console.log('Selected file:', image ? {
      name: image.name,
      size: image.size,
      type: image.type
    } : 'No file selected');
    
    if (!image) return;
    
    setisloading(true);
    setUploadStatus('Uploading profile image...');
    
    try {
      // Use the improved upload utility
      const imageUrl = await uploadImage(image, (status) => {
        setUploadStatus(status);
      });
      
      if (imageUrl) {
        const userProfilePic = {
          email: user?.email,
          profileImage: imageUrl,
        };
        
        try {
          setUploadStatus('Saving to server...');
          console.log('Attempting to update profile image for:', user?.email);
          
          const updateResponse = await fetch(`http://localhost:5001/userupdate?email=${encodeURIComponent(user?.email)}`, {
            method: 'PATCH',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify(userProfilePic),
          });
          
          const responseData = await updateResponse.json();
          console.log('Server response:', responseData);
          
          if (updateResponse.ok && responseData.success) {
            setUploadStatus('');
            showSuccess('Profile image updated successfully!');
            
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            console.error('Server error:', responseData);
            throw new Error(responseData.message || responseData.error || 'Server update failed');
          }
        } catch (serverError) {
          console.error('Profile image update error:', serverError);
          // Fallback: Save to localStorage when server is unavailable
          const userProfile = JSON.parse(localStorage.getItem('twiller_user_profile') || '{}');
          userProfile.profileImage = imageUrl;
          userProfile.email = user?.email;
          localStorage.setItem('twiller_user_profile', JSON.stringify(userProfile));
          
          window.dispatchEvent(new Event('storage'));
          
          showWarning('Profile image updated successfully! (Saved locally)');
          
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Profile image upload error:', error);
      showError(error.message || 'Failed to upload profile image');
    } finally {
      setisloading(false);
      setUploadStatus('');
      e.target.value = '';
    }
  };
  return (
    <div>
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
            <h2 className="pageTitle" style={{ margin: 0 }}>{username}</h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgb(83, 100, 113)' }}>
              {post.length} posts
            </p>
          </div>
        </div>
      </div>
      <div className="mainprofile">
        <div className="profile-bio">
          {uploadStatus && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              background: 'rgba(29, 161, 242, 0.95)',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '8px',
              zIndex: 10000,
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                borderTop: '2px solid white',
                animation: 'spin 1s linear infinite'
              }}></div>
              {uploadStatus}
            </div>
          )}
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          {
            <div>
              <div className="coverImageContainer">
                <img
                  src={
                    loggedinuser[0]?.coverimage
                      ? loggedinuser[0].coverimage
                      : user && user.photoURL
                  }
                  alt=""
                  className="coverImage"
                />
                <div className="hoverCoverImage">
                  <div className="imageIcon_tweetButton">
                    <label htmlFor="image" className="imageIcon">
                      {isloading ? (
                        <LockResetIcon className="photoIcon photoIconDisabled" />
                      ) : (
                        <CenterFocusWeakIcon className="photoIcon" />
                      )}
                    </label>
                    <input
                      type="file"
                      id="image"
                      className="imageInput"
                      onChange={handleuploadcoverimage}
                    />
                  </div>
                </div>
              </div>
              <div className="avatar-img">
                <div className="avatarContainer">
                  <img
                    src={
                      loggedinuser[0]?.profileImage
                        ? loggedinuser[0].profileImage
                        : user && user.photoURL
                    }
                    alt=""
                    className="avatar"
                  />
                  <div className="hoverAvatarImage">
                    <div className="imageIcon_tweetButton">
                      <label htmlFor="profileImage" className="imageIcon">
                        {isloading ? (
                          <LockResetIcon className="photoIcon photoIconDisabled" />
                        ) : (
                          <CenterFocusWeakIcon className="photoIcon" />
                        )}
                      </label>
                      <input
                        type="file"
                        id="profileImage"
                        className="imageInput"
                        onChange={handleuploadprofileimage}
                      />
                    </div>
                  </div>
                </div>
                <div className="userInfo">
                  <div>
                    <h3 className="heading-3">
                      {loggedinuser[0]?.name
                        ? loggedinuser[0].name
                        : user && user.displayname}
                    </h3>
                    <p className="usernameSection">@{username}</p>
                  </div>
                  <Editprofile user={user} loggedinuser={loggedinuser} />
                </div>
                <div className="infoContainer">
                  {loggedinuser[0]?.bio ? <p>{loggedinuser[0].bio}</p> : ""}
                  <div className="locationAndLink">
                    {loggedinuser[0]?.location ? (
                      <p className="suvInfo">
                        <MyLocationIcon /> {loggedinuser[0].location}
                      </p>
                    ) : (
                      ""
                    )}
                    {loggedinuser[0]?.website ? (
                      <p className="subInfo link">
                        <AddLinkIcon /> {loggedinuser[0].website}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                
                {/* Notification Settings */}
                <div className="profile-settings-section" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  marginTop: '24px',
                  marginBottom: '24px'
                }}>
                  <NotificationToggle />
                  <LoginHistory limit={5} />
                </div>
                
                {/* Tweets Section */}
                <div className="tweets-section" style={{
                  marginTop: '32px',
                  borderTop: '1px solid rgb(239, 243, 244)'
                }}>
                  <div className="tweets-header" style={{
                    padding: '16px 0',
                    borderBottom: '1px solid rgb(239, 243, 244)',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'white',
                    zIndex: 10
                  }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: '800',
                      color: 'rgb(15, 20, 25)'
                    }}>Tweets</h3>
                    <p style={{
                      margin: '4px 0 0 0',
                      fontSize: '13px',
                      color: 'rgb(83, 100, 113)'
                    }}>{post.length} {post.length === 1 ? 'tweet' : 'tweets'}</p>
                  </div>
                  
                  <div className="tweets-content">
                    {post.length === 0 ? (
                      <div className="empty-tweets-state" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '80px 40px',
                        textAlign: 'center',
                        backgroundColor: '#fafafa',
                        border: '1px dashed #e1e8ed',
                        borderRadius: '12px',
                        margin: '20px 0'
                      }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          backgroundColor: 'rgb(29, 161, 242)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '24px',
                          opacity: '0.8'
                        }}>
                          <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                          </svg>
                        </div>
                        <h3 style={{
                          color: 'rgb(15, 20, 25)',
                          fontSize: '18px',
                          fontWeight: '700',
                          margin: '0 0 8px 0'
                        }}>No tweets yet</h3>
                        <p style={{
                          color: 'rgb(83, 100, 113)',
                          fontSize: '15px',
                          lineHeight: '20px',
                          margin: '0 0 16px 0',
                          maxWidth: '280px'
                        }}>Start sharing your thoughts with the world. Your first tweet is just a click away!</p>
                        <button 
                          onClick={() => console.log('Compose tweet')}
                          style={{
                            backgroundColor: 'rgb(29, 161, 242)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '9999px',
                            padding: '12px 24px',
                            fontSize: '15px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = 'rgb(26, 140, 216)'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'rgb(29, 161, 242)'}
                        >
                          Tweet now
                        </button>
                      </div>
                    ) : (
                      <div className="tweets-list">
                        {post.map((p) => (
                          <Post key={p._id} p={p} isProfileView={true} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default Mainprofile;
