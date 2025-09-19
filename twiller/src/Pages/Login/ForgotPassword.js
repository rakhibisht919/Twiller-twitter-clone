import React, { useState, useEffect } from "react";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import { Link } from "react-router-dom";
import "./forgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resetMethod, setResetMethod] = useState("email");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lastResetTime, setLastResetTime] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Check if user has already requested reset today
  useEffect(() => {
    const savedTime = localStorage.getItem('lastPasswordReset');
    if (savedTime) {
      const lastReset = new Date(savedTime);
      const now = new Date();
      const timeDiff = now - lastReset;
      const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (timeDiff < oneDay) {
        setLastResetTime(lastReset);
        setError("You can only request password reset once per day. Please try again tomorrow.");
      }
    }
  }, []);

  // Generate random password (only letters, no special characters or numbers)
  const generatePassword = () => {
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    let password = '';
    
    // Ensure at least one uppercase and one lowercase letter
    password += upperCase[Math.floor(Math.random() * upperCase.length)];
    password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
    
    // Fill the rest with random letters (total length 12)
    const allLetters = upperCase + lowerCase;
    for (let i = 2; i < 12; i++) {
      password += allLetters[Math.floor(Math.random() * allLetters.length)];
    }
    
    // Shuffle the password to ensure random distribution of upper/lowercase
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    setGeneratedPassword(password);
    setShowPassword(true);
    
    // Store the generated password in localStorage for login
    if (resetMethod === "email" && email) {
      const tempPasswords = JSON.parse(localStorage.getItem('tempPasswords') || '{}');
      tempPasswords[email] = password;
      localStorage.setItem('tempPasswords', JSON.stringify(tempPasswords));
    } else if (resetMethod === "phone" && phone) {
      const tempPasswords = JSON.parse(localStorage.getItem('tempPasswords') || '{}');
      tempPasswords[phone] = password;
      localStorage.setItem('tempPasswords', JSON.stringify(tempPasswords));
    }
    
    return password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Check if user has already requested reset today
    if (lastResetTime) {
      const now = new Date();
      const timeDiff = now - lastResetTime;
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (timeDiff < oneDay) {
        setError("You can only request password reset once per day. Please try again tomorrow.");
        setIsLoading(false);
        return;
      }
    }

    try {      
      if (resetMethod === "email" && email) {
        // Generate a new password for the user
        const password = generatePassword();
        setShowPassword(true);
        
        // Store the reset request in database and send email with RESET LINK
        try {
          const response = await fetch('http://192.168.29.125:5001/password-reset-request', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
              timestamp: new Date()
            })
          });
          
          const result = await response.json();
          
          if (result.success && result.messageSent) {
            setSuccess(`✅ Success! A password reset link has been sent to your email address. You can also use the generated password below to log in to your account.`);
          } else if (result.success) {
            setSuccess(`⚠️ Your password has been reset! Use the generated password below to log in to your account.`);
            if (result.messageDetails?.error) {
              console.error('Email sending issue:', result.messageDetails.error);
              setError(`Note: ${result.messageDetails.error}`);
            }
          } else {
            // Handle server errors (like user not found)
            setError(result.error || 'Failed to reset password. Please make sure you have an account with this email.');
            setIsLoading(false);
            return;
          }
          
          localStorage.setItem('lastPasswordReset', new Date().toISOString());
          setLastResetTime(new Date());
        } catch (err) {
          console.error('Failed to process password reset:', err);
          setSuccess(`Your password has been reset! Use the generated password below to log in to your account.`);
          // Still update the reset time even if there was an error
          localStorage.setItem('lastPasswordReset', new Date().toISOString());
          setLastResetTime(new Date());
        }
      } else if (resetMethod === "phone" && phone) {
        // Generate a new password for the user
        const password = generatePassword();
        setShowPassword(true);
        
        // Store the reset request in database and send SMS
        try {
          const response = await fetch('http://192.168.29.125:5001/passwordreset', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phone,
              password,
              timestamp: new Date(),
              method: 'sms_reset'
            })
          });
          
          const result = await response.json();
          
          if (result.success && result.messageSent) {
            setSuccess(`✅ Success! Your password has been reset and sent to your phone number. You can also use the generated password below to log in to your account.`);
          } else if (result.success) {
            setSuccess(`⚠️ Your password has been reset! Use the generated password below to log in to your account.`);
            if (result.messageDetails?.error) {
              console.error('SMS sending issue:', result.messageDetails.error);
              setError(`Note: ${result.messageDetails.error}`);
            }
          } else {
            // Handle server errors (like user not found)
            setError(result.error || 'Failed to reset password. Please make sure you have an account with this phone number.');
            setIsLoading(false);
            return;
          }
          
          localStorage.setItem('lastPasswordReset', new Date().toISOString());
          setLastResetTime(new Date());
        } catch (err) {
          console.error('Failed to process password reset:', err);
          setSuccess(`Your password has been reset! Use the generated password below to log in to your account.`);
          // Still update the reset time even if there was an error
          localStorage.setItem('lastPasswordReset', new Date().toISOString());
          setLastResetTime(new Date());
        }
      } else {
        setError("Please enter a valid email or phone number.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const canRequestReset = !lastResetTime || (() => {
    const now = new Date();
    const timeDiff = now - lastResetTime;
    const oneDay = 24 * 60 * 60 * 1000;
    return timeDiff >= oneDay;
  })();

  return (
    <div className="login-container">
      <div className="image-container">
        <img src={twitterimg} className="image" alt="twitterimg" />
      </div>
      <div className="form-container">
        <div className="form-box">
          <TwitterIcon style={{ color: "skyblue" }} />
          <h2 className="heading">Reset your password</h2>
          
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          
          <form onSubmit={handleSubmit}>
            <div className="reset-method-toggle">
              <button
                type="button"
                className={`toggle-btn ${resetMethod === "email" ? "active" : ""}`}
                onClick={() => setResetMethod("email")}
              >
                Email
              </button>
              <button
                type="button"
                className={`toggle-btn ${resetMethod === "phone" ? "active" : ""}`}
                onClick={() => setResetMethod("phone")}
              >
                Phone
              </button>
            </div>

            {resetMethod === "email" ? (
              <input
                type="email"
                className="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            ) : (
              <input
                type="tel"
                className="phone"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            )}

            <div className="btn-login">
              <button 
                type="submit" 
                className="btn"
                disabled={isLoading || !canRequestReset}
              >
                {isLoading ? "Generating..." : "Reset Password"}
              </button>
            </div>
          </form>

          <div className="password-generator">
            <h3>Your New Password</h3>
            <button 
              type="button" 
              className="generate-btn"
              onClick={generatePassword}
            >
              Generate New Password
            </button>
            
            {showPassword && generatedPassword && (
              <div className="generated-password">
                <p>Generated Password:</p>
                <div className="password-display">
                  <span className="password-text">{generatedPassword}</span>
                  <button 
                    type="button"
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPassword)
                        .then(() => {
                          setCopySuccess(true);
                          // Reset the success message after 3 seconds
                          setTimeout(() => setCopySuccess(false), 3000);
                        })
                        .catch(err => {
                          console.error('Failed to copy: ', err);
                          alert("Failed to copy password. Please try again.");
                        });
                    }}
                  >
                    {copySuccess ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="password-info">
              This password contains only letters (uppercase and lowercase), no numbers or special characters.
            </p>
            <div className="email-note">
              <p><strong>Important:</strong> This generated password is your new account password. A reset link has been sent to your {resetMethod === "email" ? "email address" : "phone number"} and the password is also displayed here. Use it to log in to your account. Make sure to save or memorize it!</p>
            </div>
              </div>
            )}
          </div>

          <hr />
          
          <div className="links">
            <Link to="/login" className="back-link">
              Back to Login
            </Link>
            <Link to="/signup" className="signup-link">
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
