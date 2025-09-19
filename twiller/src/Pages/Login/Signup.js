import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import GoogleButton from "react-google-button";
import { useUserAuth } from "../../context/UserAuthContext";
import UsernameSelection from "../../components/UsernameSelection/UsernameSelection";
import API_BASE_URL from "../../config/api";
import "./login.css";

const Signup = () => {
  // Removed unused username and setusername variables
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [error, seterror] = useState("");
  const [success, setSuccess] = useState("");
  const [password, setpassword] = useState("");
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [pendingUserData, setPendingUserData] = useState(null);
  const { signUp, user } = useUserAuth();
  const { googleSignIn } = useUserAuth();
  const navigate = useNavigate();


  const sendVerificationEmail = async (userEmail, userName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          name: userName
        }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    seterror("");
    setSuccess("");
    
    try {
      await signUp(email, password);
      
      // Send verification email
      const emailSent = await sendVerificationEmail(email, name);
      
      if (emailSent) {
        setSuccess('Account created successfully! Please check your email to verify your account before signing in.');
        seterror('');
        
        // Show success message and redirect after delay
        setTimeout(() => {
          setSuccess('');
          navigate('/login', { 
            state: { 
              message: 'Please verify your email before signing in. Check your inbox for a verification link.',
              email: email 
            }
          });
        }, 4000);
      } else {
        // Account created but email verification failed
        setSuccess('Account created successfully! However, we couldn\'t send the verification email. You can still sign in.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
      
    } catch (error) {
      // Handle specific error cases
      if (error.code === 'auth/email-already-in-use') {
        // Try to check if the account exists in our database
        try {
          const response = await fetch(`${API_BASE_URL}/check-email-exists?email=${email}`);
          const data = await response.json();
          
          if (!data.exists) {
            // Email exists in Firebase but not in our database - likely a deleted account
            // Allow re-registration by forcing Firebase account deletion
            try {
              await fetch(`${API_BASE_URL}/force-delete-firebase-account`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
              });
              
              // Retry signup after forced deletion
              setTimeout(() => {
                handlesubmit(e);
              }, 1500);
              return;
            } catch (deleteError) {
              console.error('Failed to force delete account:', deleteError);
            }
          }
        } catch (checkError) {
          console.error('Failed to check email existence:', checkError);
        }
        
        seterror('Account already exists. Please login or signup with another account.');
      } else {
        seterror(error.message);
      }
    }
  };
  const hanglegooglesignin = async (e) => {
    e.preventDefault();
    seterror("");
    
    try {
      console.log('Starting Google Sign-In process...');
      
      // Show loading state
      seterror("Signing in with Google...");
      
      const result = await googleSignIn();
      
      console.log('Google Sign-In result received:', result.user?.email);
      seterror(""); // Clear loading message
      
      // Check if user exists in our system (server or localStorage)
      let userExists = false;
      
      try {
        // First check server
        const response = await fetch(`${API_BASE_URL}/loggedinuser?email=${result.user.email}`);
        if (response.ok) {
          const userData = await response.json();
          userExists = userData && userData.length > 0;
        }
      } catch (serverError) {
        console.log('Server check failed, using localStorage fallback');
        // If server unavailable, check localStorage
        const localProfile = localStorage.getItem('twiller_user_profile');
        if (localProfile) {
          const profile = JSON.parse(localProfile);
          userExists = profile.email === result.user.email;
        }
      }
      
      if (!userExists) {
        // Show username selection for new users
        setPendingUserData({
          name: result.user.displayName,
          email: result.user.email,
          firebaseUser: result.user
        });
        setShowUsernameModal(true);
      } else {
        // Existing user, navigate directly to home
        console.log('Existing user found, navigating to home...');
        navigate("/");
      }
      
    } catch (error) {
      console.error('Google Sign-In error in component:', error);
      
      // Show specific error message based on error type
      if (error.message.includes('cancelled')) {
        seterror('Sign-in was cancelled. Please try again.');
      } else if (error.message.includes('blocked')) {
        seterror('Pop-ups are blocked. Please allow pop-ups for this site or use email/password login.');
      } else if (error.message.includes('network')) {
        seterror('Network error. Please check your connection and try again.');
      } else if (error.message.includes('unavailable') || error.message.includes('not properly configured')) {
        seterror('Google Sign-In is currently unavailable. Please use email/password login instead.');
      } else {
        seterror('Google Sign-In failed. Please try again or use email/password login.');
      }
    }
  };
  
  const handleUsernameSelect = async (selectedUsername) => {
    try {
      const user = {
        username: selectedUsername,
        name: pendingUserData.name,
        email: pendingUserData.email,
      };
      
      // Try to register with server, fallback to localStorage
      try {
        const response = await fetch(`${API_BASE_URL}/register`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(user),
        });
        
        const data = await response.json();
        if (data.acknowledged) {
          console.log('User registered successfully');
        }
      } catch (serverError) {
        // Fallback: Save to localStorage
        const userProfile = {
          ...user,
          profileImage: pendingUserData.firebaseUser?.photoURL || null
        };
        localStorage.setItem('twiller_user_profile', JSON.stringify(userProfile));
        console.log('User data saved locally');
      }
      
      setShowUsernameModal(false);
      setPendingUserData(null);
      navigate("/");
      
    } catch (error) {
      console.error('Error completing registration:', error);
      seterror('Failed to complete registration. Please try again.');
    }
  };
  
  const handleUsernameModalClose = () => {
    // Don't allow closing without selecting username
    // User must either select a username or skip
  };
  return (
    <>
      <div className="login-container">
        <div className="image-container">
          <img className="image" src={twitterimg} alt="twitterimage" />
        </div>

        <div className="form-container">
          <div className="">
            <TwitterIcon className="Twittericon" style={{ color: "skyblue" }} />
            <h2 className="heading">Happening now</h2>
            <div class="d-flex align-items-sm-center">
              <h3 className="heading1"> Join twiller today</h3>
            </div>
            {error && <p className="errorMessage">{error}</p>}
            {success && <p className="successMessage">{success}</p>}
            <form onSubmit={handlesubmit}>
              <input
                className="display-name"
                type="name"
                placeholder="Enter Full Name"
                onChange={(e) => setname(e.target.value)}
                required
              />
              <input
                className="email"
                type="email"
                placeholder="Email Address"
                onChange={(e) => setemail(e.target.value)}
                required
              />
              <input
                className="password"
                type="password"
                placeholder="Password"
                onChange={(e) => setpassword(e.target.value)}
                required
                minLength="6"
              />
              <div className="btn-login">
                <button type="submit" className="btn">
                  Sign Up
                </button>
              </div>
            </form>
            <hr />
            <div className="google-button">
              <GoogleButton
                className="g-btn"
                type="light"
                onClick={hanglegooglesignin}
              />
            </div>
            <div>
              Already have an account?
              <Link
                to="/login"
                style={{
                  textDecoration: "none",
                  color: "var(--twitter-color)",
                  fontWeight: "600",
                  marginLeft: "5px",
                }}
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Username Selection Modal */}
      {pendingUserData && (
        <UsernameSelection
          open={showUsernameModal}
          onClose={handleUsernameModalClose}
          onUsernameSelect={handleUsernameSelect}
          userDisplayName={pendingUserData?.name}
          userEmail={pendingUserData?.email}
        />
      )}
    </>
  );
};

export default Signup;
