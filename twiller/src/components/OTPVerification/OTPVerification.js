import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import { Email } from '@mui/icons-material';
import './OTPVerification.css';

const OTPVerification = ({ email, onVerify, onCancel, useServerOTP = true }) => {
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(useServerOTP ? 600 : 300); // 10 minutes for server OTP, 5 for client
  const [isExpired, setIsExpired] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!useServerOTP) {
      // Generate and "send" OTP for client-side mode
      const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOTP(newOTP);
      
      // In a real app, you would send this via email
      console.log(`OTP for ${email}: ${newOTP}`);
      setSuccess(`OTP sent to ${email}. Check console for demo OTP: ${newOTP}`);
    } else {
      // Server-side OTP is already sent, just show status
      setSuccess(`OTP has been sent to ${email}. Please check your inbox.`);
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, useServerOTP]);

  const handleVerify = async () => {
    setError('');
    setIsVerifying(true);
    
    if (isExpired) {
      setError('OTP has expired. Please request a new one.');
      setIsVerifying(false);
      return;
    }

    if (useServerOTP) {
      try {
        const response = await fetch('http://localhost:5001/verify-login-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            otp: otp
          })
        });
        
        const data = await response.json();
        setIsVerifying(false);
        
        if (data.success) {
          onVerify(true);
        } else {
          setError(data.error || 'Invalid OTP. Please try again.');
        }
      } catch (error) {
        console.log('Server OTP verification failed, falling back to client-side:', error);
        setIsVerifying(false);
        // Fallback to client-side verification
        if (otp === generatedOTP) {
          onVerify(true);
        } else {
          setError('Invalid OTP. Please try again.');
        }
      }
    } else {
      // Client-side verification
      setIsVerifying(false);
      if (otp === generatedOTP) {
        onVerify(true);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    }
  };

  const handleResend = () => {
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(newOTP);
    setTimeLeft(300);
    setIsExpired(false);
    setError('');
    console.log(`New OTP for ${email}: ${newOTP}`);
    setSuccess(`New OTP sent to ${email}. Check console for demo OTP: ${newOTP}`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box className="otp-verification-container">
      <div className="otp-header">
        <Email className="email-icon" />
        <Typography variant="h5" className="otp-title">
          Email Verification Required
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Chrome browser requires additional security verification
        </Typography>
      </div>

      {success && (
        <Alert severity="info" className="otp-alert">
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" className="otp-alert">
          {error}
        </Alert>
      )}

      <div className="otp-input-section">
        <TextField
          fullWidth
          label="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          variant="outlined"
          className="otp-input"
          disabled={isExpired}
        />
        
        <Typography variant="body2" className="timer-text">
          {isExpired ? (
            <span className="expired-text">OTP Expired</span>
          ) : (
            <span>Time remaining: {formatTime(timeLeft)}</span>
          )}
        </Typography>
      </div>

      <div className="otp-buttons">
        <Button
          variant="contained"
          onClick={handleVerify}
          disabled={otp.length !== 6 || isExpired || isVerifying}
          className="verify-btn"
        >
          {isVerifying ? 'Verifying...' : 'Verify OTP'}
        </Button>
        
        <Button
          variant="outlined"
          onClick={handleResend}
          className="resend-btn"
        >
          Resend OTP
        </Button>
        
        <Button
          variant="text"
          onClick={onCancel}
          className="cancel-btn"
        >
          Cancel
        </Button>
      </div>
    </Box>
  );
};

export default OTPVerification;
