import React, { useState } from "react";
import { Box, Modal } from "@mui/material";
import Button from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import TextField from "@mui/material/TextField";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "./Editprofile.css";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  height: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 8,
};

function Editchild({ dob, setdob }) {
  const [open, setopen] = useState(false);
  const handleopen = () => {
    setopen(true);
  };
  const handleclose = () => {
    setopen(false);
  };
  return (
    <React.Fragment>
      <div className="birthdate-section" onClick={handleopen}>
        <text>Edit</text>
      </div>
      <Modal
        hideBackdrop
        open={open}
        onClose={handleclose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-descriptiom"
      >
        <Box sx={{ ...style, width: 300, height: 300 }}>
          <div className="text">
            <h2>Edit date of birth</h2>
            <p>
              This can only be changed a few times
              <br />
              Make sure you enter the age of the <br />
              person using the account.{" "}
            </p>
            <input type="date" onChange={(e) => setdob(e.target.value)} />
            <button
              className="e-button"
              onClick={() => {
                setopen(false);
              }}
            >
              Cancel
            </button>
          </div>
        </Box>
      </Modal>
    </React.Fragment>
  );
}

const Editprofile = ({ user, loggedinuser }) => {
  const [name, setname] = useState(loggedinuser[0]?.name || "");
  const [username, setusername] = useState(loggedinuser[0]?.username || "");
  const [bio, setbio] = useState(loggedinuser[0]?.bio || "");
  const [location, setlocation] = useState(loggedinuser[0]?.location || "");
  const [website, setwebsite] = useState(loggedinuser[0]?.website || "");
  const [open, setopen] = useState(false);
  const [dob, setdob] = useState(loggedinuser[0]?.dob || "");
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState("");
  const [success, setsuccess] = useState("");
  const handlesave = async () => {
    setloading(true);
    seterror("");
    setsuccess("");
    
    // Validation
    if (name.trim().length < 1) {
      seterror("Name is required");
      setloading(false);
      return;
    }
    
    if (username.trim().length < 3) {
      seterror("Username must be at least 3 characters");
      setloading(false);
      return;
    }
    
    // Check for valid username format (alphanumeric and underscores only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      seterror("Username can only contain letters, numbers, and underscores");
      setloading(false);
      return;
    }
    
    const editinfo = {
      name: name.trim(),
      username: username.trim().toLowerCase(),
      bio: bio.trim(),
      location: location.trim(),
      website: website.trim(),
      dob,
    };
    
    try {
      const response = await fetch(`http://localhost:5001/userupdate?email=${encodeURIComponent(user?.email)}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(editinfo),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile update successful:', data);
        
        // Also save to localStorage as backup
        const existingProfile = JSON.parse(localStorage.getItem('twiller_user_profile') || '{}');
        const updatedProfile = { ...existingProfile, ...editinfo, email: user?.email };
        localStorage.setItem('twiller_user_profile', JSON.stringify(updatedProfile));
        
        setsuccess("Profile updated successfully!");
        setTimeout(() => {
          setopen(false);
          window.location.reload(); // Refresh to show updated data
        }, 1500);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown server error' }));
        console.error('Server error response:', errorData);
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("Profile update error:", err);
      
      // Check if it's a network error (server unavailable)
      if (err.message.includes('fetch') || err.name === 'TypeError') {
        // Fallback: Save to localStorage when server is unavailable
        try {
          const existingProfile = JSON.parse(localStorage.getItem('twiller_user_profile') || '{}');
          const updatedProfile = { ...existingProfile, ...editinfo, email: user?.email };
          localStorage.setItem('twiller_user_profile', JSON.stringify(updatedProfile));
          
          // Trigger a storage event to update other components
          window.dispatchEvent(new Event('storage'));
          
          setsuccess("Profile updated successfully! (Saved locally)");
          setTimeout(() => {
            setopen(false);
            window.location.reload();
          }, 1500);
        } catch (storageErr) {
          seterror("Failed to save profile. Please try again.");
        }
      } else {
        seterror(err.message || "Failed to update profile. Please try again.");
      }
    }
    
    setloading(false);
  };
  return (
    <div>
      <button
        onClick={() => {
          setopen(true);
        }}
        className="Edit-profile-btn"
      >
        Edit profile
      </button>
      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-descriptiom"
      >
        <Box style={style} className="modal">
          <div className="header">
            <IconButton onClick={() => setopen(false)}>
              <CloseIcon />
            </IconButton>
            <h2 className="header-title">Edit Profile</h2>
            <button 
              className="save-btn" 
              onClick={handlesave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
          <form className="fill-content">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <TextField
              className="text-field"
              fullWidth
              label="Name"
              id="name-field"
              variant="filled"
              value={name}
              onChange={(e) => setname(e.target.value)}
              placeholder="Enter your display name"
              inputProps={{ maxLength: 50 }}
            />
            
            <TextField
              className="text-field"
              fullWidth
              label="Username"
              id="username-field"
              variant="filled"
              value={username}
              onChange={(e) => setusername(e.target.value)}
              placeholder="Enter your username"
              helperText="Username can only contain letters, numbers, and underscores"
              inputProps={{ maxLength: 15 }}
            />
            <TextField
              className="text-field"
              fullWidth
              label="Bio"
              id="bio-field"
              variant="filled"
              value={bio}
              onChange={(e) => setbio(e.target.value)}
              placeholder="Tell the world about yourself"
              multiline
              rows={3}
              inputProps={{ maxLength: 160 }}
              helperText={`${bio.length}/160 characters`}
            />
            
            <TextField
              className="text-field"
              fullWidth
              label="Location"
              id="location-field"
              variant="filled"
              value={location}
              onChange={(e) => setlocation(e.target.value)}
              placeholder="Where are you located?"
              inputProps={{ maxLength: 30 }}
            />
            
            <TextField
              className="text-field"
              fullWidth
              label="Website"
              id="website-field"
              variant="filled"
              value={website}
              onChange={(e) => setwebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              inputProps={{ maxLength: 100 }}
            />
          </form>
          <div className="birthdate-section">
            <p>Birth Date</p>
            <p>.</p>
            <Editchild dob={dob} setdob={setdob} />
          </div>
          <div className="last-section">
            {loggedinuser[0]?.dob ? (
              <h2>{loggedinuser[0]?.dob}</h2>
            ) : (
              <h2>{dob ? dob : "Add your date of birth"}</h2>
            )}
            <div className="last-btn">
              <h2>Switch to Professional</h2>
              <ChevronRightIcon />
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default Editprofile;
