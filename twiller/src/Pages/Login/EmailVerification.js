import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import TwitterIcon from '@mui/icons-material/Twitter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CircularProgress from '@mui/material/CircularProgress';
import API_BASE_URL from '../../config/api';
import './login.css';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token && email) {
      verifyEmail(token, email);
    } else {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
    }
  }, [token, email]);

  // Countdown timer for resend button
  useEffect(() => {
    let interval = null;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
    } else if (resendCountdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [resendCountdown, resendDisabled]);

  const verifyEmail = async (verificationToken, userEmail) => {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          token: verificationToken
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now sign in to your account.');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to verify email. The link may be invalid or expired.');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage('Network error occurred. Please try again later.');
    }
  };

  const resendVerificationEmail = async () => {
    if (!email) return;

    setResendDisabled(true);
    setResendCountdown(60); // 60 seconds countdown

    try {
      const response = await fetch(`${API_BASE_URL}/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          name: 'User' // Default name for resend
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('A new verification email has been sent to your email address.');
      } else {
        setMessage('Failed to resend verification email. Please try again later.');
        setResendDisabled(false);
        setResendCountdown(0);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage('Network error occurred. Please try again later.');
      setResendDisabled(false);
      setResendCountdown(0);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <CircularProgress size={60} style={{ color: '#1da1f2' }} />;
      case 'success':
        return <CheckCircleIcon style={{ fontSize: 60, color: '#1da1f2' }} />;
      case 'error':
        return <ErrorIcon style={{ fontSize: 60, color: '#f44336' }} />;
      default:
        return null;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'verifying':
        return 'Verifying Your Email...';
      case 'success':
        return 'Email Verified Successfully!';
      case 'error':
        return 'Verification Failed';
      default:
        return '';
    }
  };

  return (
    <div className="login-container">
      <div className="form-container" style={{ 
        textAlign: 'center', 
        padding: '40px', 
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <TwitterIcon className="Twittericon" style={{ color: "skyblue", fontSize: 50, marginBottom: 20 }} />
        
        <div style={{ marginBottom: 30 }}>
          {getStatusIcon()}
        </div>
        
        <h2 className="heading" style={{ marginBottom: 20 }}>
          {getStatusTitle()}
        </h2>
        
        <p style={{ 
          fontSize: 16, 
          color: '#657786', 
          lineHeight: 1.5, 
          marginBottom: 30,
          maxWidth: 400,
          margin: '0 auto 30px auto'
        }}>
          {message}
        </p>
        
        {status === 'success' && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ color: '#1da1f2', fontWeight: 'bold' }}>
              Redirecting to login page in 3 seconds...
            </p>
            <Link to="/login" className="btn" style={{ 
              display: 'inline-block', 
              marginTop: 10,
              textDecoration: 'none',
              padding: '10px 20px'
            }}>
              Go to Login Now
            </Link>
          </div>
        )}
        
        {status === 'error' && email && (
          <div>
            <button 
              onClick={resendVerificationEmail}
              disabled={resendDisabled}
              className="btn"
              style={{ 
                marginBottom: 20,
                opacity: resendDisabled ? 0.6 : 1,
                cursor: resendDisabled ? 'not-allowed' : 'pointer'
              }}
            >
              {resendDisabled 
                ? `Resend Email (${resendCountdown}s)` 
                : 'Resend Verification Email'
              }
            </button>
            <p style={{ fontSize: 14, color: '#657786' }}>
              Check your spam folder if you don't receive the email.
            </p>
          </div>
        )}
        
        <div style={{ marginTop: 30 }}>
          <Link to="/login" style={{ color: '#1da1f2', textDecoration: 'none' }}>
            Back to Login
          </Link>
          {' | '}
          <Link to="/signup" style={{ color: '#1da1f2', textDecoration: 'none' }}>
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;