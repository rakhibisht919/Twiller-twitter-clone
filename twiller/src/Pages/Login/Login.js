import React, { useState, useContext, useEffect } from "react";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import GoogleButton from "react-google-button";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./login.css";
import { useUserAuth } from "../../context/UserAuthContext";
import { getDeviceInfo, getAuthRequirements } from "../../utils/deviceDetection";
import OTPVerification from "../../components/OTPVerification/OTPVerification";
import { Alert, Button } from "@mui/material";
import API_BASE_URL from "../../config/api";

const Login = () => {
  const [email, seteamil] = useState("");
  const [password, setpassword] = useState("");
  const [error, seterror] = useState("");
  const [success, setSuccess] = useState("");
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [authRequirements, setAuthRequirements] = useState(null);
  const [showOTP, setShowOTP] = useState(false);
  const [accessBlocked, setAccessBlocked] = useState(false);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { googleSignIn, logIn, user } = useUserAuth();
  
  // Check for messages from signup page
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      if (location.state.email) {
        seteamil(location.state.email);
      }
    }
  }, [location]);
  
  // Check if user is already authenticated (for redirect flow)
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const initializeDeviceInfo = async () => {
      const info = getDeviceInfo();
      const ipAddress = await info.getIPAddress();
      const fullDeviceInfo = { ...info, ipAddress };
      
      setDeviceInfo(fullDeviceInfo);
      
      // Check device access with server
      try {
        const response = await fetch(`${API_BASE_URL}/check-device-access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deviceInfo: fullDeviceInfo })
        });
        
        const data = await response.json();
        if (data.success) {
          setAuthRequirements(data.authRequirements);
          
          if (!data.authRequirements.allowAccess) {
            setAccessBlocked(true);
            seterror(data.authRequirements.reason);
          }
        } else {
          // Fallback to client-side check
          const requirements = getAuthRequirements(fullDeviceInfo);
          setAuthRequirements(requirements);
          
          if (!requirements.allowAccess) {
            setAccessBlocked(true);
            seterror(requirements.reason);
          }
        }
      } catch (error) {
        console.log('Server unavailable, using client-side device check:', error);
        // Fallback to client-side check
        const requirements = getAuthRequirements(fullDeviceInfo);
        setAuthRequirements(requirements);
        
        if (!requirements.allowAccess) {
          setAccessBlocked(true);
          seterror(requirements.reason);
        }
      }
    };
    
    initializeDeviceInfo();
  }, []);

  const checkEmailVerification = async (userEmail) => {
    try {
      const response = await fetch(`${API_BASE_URL}/verification-status?email=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      return data.emailVerified;
    } catch (error) {
      console.log('Could not check email verification status:', error);
      return true; // Allow login if verification check fails
    }
  };

  const resendVerificationEmail = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          name: 'User'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Verification email sent successfully! Please check your inbox.');
      } else {
        seterror('Failed to send verification email. Please try again.');
      }
    } catch (error) {
      seterror('Failed to send verification email. Please try again.');
    }
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    seterror("");
    setSuccess("");
    
    if (accessBlocked) {
      seterror(authRequirements.reason);
      return;
    }
    
    try {
      // Check if this is a temporary password login
      const tempPasswords = JSON.parse(localStorage.getItem('tempPasswords') || '{}');
      const storedTempPassword = tempPasswords[email];
      
      if (storedTempPassword && storedTempPassword === password) {
        // This is a login with a temporary password
        try {
          // First login with regular method
          await logIn(email, password);
          
          // Remove the temporary password from storage
          delete tempPasswords[email];
          localStorage.setItem('tempPasswords', JSON.stringify(tempPasswords));
          
          if (authRequirements.requiresOTP) {
            setShowOTP(true);
          } else {
            completeLogin();
          }
        } catch (error) {
          seterror("Login failed with temporary password. Please try again or request a new password reset.");
        }
      } else {
        // Check email verification before proceeding
        const isEmailVerified = await checkEmailVerification(email);
        
        if (!isEmailVerified) {
          setEmailVerificationRequired(true);
          seterror("Please verify your email address before signing in. Check your inbox for a verification link.");
          return;
        }
        
        // Regular login flow
        await logIn(email, password);
        
        if (authRequirements.requiresOTP) {
          // Send OTP via server
          try {
            const otpResponse = await fetch(`${API_BASE_URL}/send-login-otp`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: email,
                deviceInfo: deviceInfo
              })
            });
            
            const otpData = await otpResponse.json();
            if (otpData.success) {
              setShowOTP(true);
              setSuccess('OTP sent to your email address. Please check your inbox.');
            } else {
              // Fallback to client-side OTP
              setShowOTP(true);
            }
          } catch (otpError) {
            console.log('Server OTP unavailable, using client-side OTP:', otpError);
            setShowOTP(true);
          }
        } else {
          completeLogin();
        }
      }
    } catch (error) {
      seterror(error.message);
      
      // Track failed login attempt
      try {
        await fetch(`${API_BASE_URL}/track-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            deviceInfo: deviceInfo,
            loginSuccess: false,
            failureReason: error.message
          })
        });
      } catch (trackError) {
        console.log('Failed to track failed login on server:', trackError);
      }
    }
  };

  const completeLogin = async () => {
    // Track successful login on server
    try {
      await fetch(`${API_BASE_URL}/track-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          deviceInfo: deviceInfo,
          loginSuccess: true,
          authMethod: authRequirements?.requiresOTP ? 'otp' : 'password'
        })
      });
    } catch (error) {
      console.log('Failed to track login on server:', error);
    }
    
    // Store successful login info locally as backup
    const loginHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
    loginHistory.push({
      ...deviceInfo,
      loginSuccess: true,
      timestamp: new Date().toISOString(),
      email: email,
      authMethod: authRequirements?.requiresOTP ? 'otp' : 'password'
    });
    localStorage.setItem('loginHistory', JSON.stringify(loginHistory.slice(-10)));
    
    navigate("/");
  };

  const handleOTPVerification = (success) => {
    if (success) {
      setShowOTP(false);
      completeLogin();
    } else {
      seterror("OTP verification failed");
    }
  };
  
  const hanglegooglesignin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        // Successful popup authentication
        navigate("/");
      }
      // If result is undefined, it means redirect was used
      // and the page will reload with the authenticated user
    } catch (error) {
      console.log(error.message);
      seterror("Google Sign-In failed. Please try again.");
    }
  };
  
  if (showOTP) {
    return (
      <div className="login-container">
        <div className="image-container">
          <img src={twitterimg} className="image" alt="twitterimg" />
        </div>
        <div className="form-container">
          <OTPVerification
            email={email}
            onVerify={handleOTPVerification}
            onCancel={() => setShowOTP(false)}
            useServerOTP={true}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="login-container">
        <div className="image-container">
          <img src={twitterimg} className=" image" alt="twitterimg" />
        </div>
        <div className="form-container">
          <div className="form-box">
            <TwitterIcon style={{ color: "skyblue" }} />
            <h2 className="heading">Happening now</h2>
            
            {deviceInfo && authRequirements && (
              <Alert severity="info" className="device-info-alert">
                Device: {deviceInfo.deviceType} | Browser: {deviceInfo.browser} | OS: {deviceInfo.os}
                {authRequirements.reason && <br />}{authRequirements.reason}
              </Alert>
            )}
            
            {success && <Alert severity="success" className="success-alert">{success}</Alert>}
            {error && <Alert severity="error" className="error-alert">{error}</Alert>}
            
            {emailVerificationRequired && (
              <div style={{ marginBottom: 20, textAlign: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={resendVerificationEmail}
                  style={{ 
                    backgroundColor: '#1da1f2',
                    marginTop: 10,
                    textTransform: 'none'
                  }}
                >
                  Resend Verification Email
                </Button>
                <p style={{ fontSize: 14, color: '#657786', marginTop: 10 }}>
                  Haven't received the email? Check your spam folder or click above to resend.
                </p>
              </div>
            )}
            
            <form onSubmit={handlesubmit}>
              <input
                type="email"
                className="email"
                placeholder="Email address"
                onChange={(e) => seteamil(e.target.value)}
                required
                disabled={accessBlocked}
              />
              <input
                type="password"
                className="password"
                placeholder="Password"
                onChange={(e) => setpassword(e.target.value)}
                required
                disabled={accessBlocked}
              />
              <div className="btn-login">
                <button type="submit" className="btn" disabled={accessBlocked}>
                  Log In
                </button>
              </div>
            </form>
            <div className="forgot-password-link">
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>
            <hr />
            <div className="google-signin-section">
              <GoogleButton 
                className="g-btn" 
                type="light" 
                onClick={hanglegooglesignin}
                disabled={accessBlocked}
              />
            </div>
            <div className="signup-section">
              <span className="signup-text">Don't have an account?</span>
              <Link to="/signup" className="signup-link">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
