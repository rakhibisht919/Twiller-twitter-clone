import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import {
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Box,
  Typography,
  InputAdornment,
  IconButton
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
  Lock,
  Security
} from "@mui/icons-material";
import "./resetPassword.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid reset link. Please request a new password reset.');
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch('http://192.168.29.125:5001/validate-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (result.success) {
          setTokenValid(true);
          setUserEmail(result.email);
        } else {
          setError('This reset link has expired or is invalid. Please request a new password reset.');
        }
      } catch (err) {
        console.error('Token validation error:', err);
        setError('Unable to validate reset link. Please try again.');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < 6) {
      errors.push('Must be at least 6 characters long');
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      errors.push('Must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      errors.push('Must contain at least one uppercase letter');
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validation
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(`Password requirements: ${passwordErrors.join(', ')}`);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://192.168.29.125:5001/password-reset-confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Password reset successful! You can now log in with your new password.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.error || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An error occurred while resetting your password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while validating token
  if (isValidating) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-content">
          <Paper className="reset-password-card" elevation={3}>
            <Box display="flex" flexDirection="column" alignItems="center" p={4}>
              <CircularProgress size={40} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Validating reset link...
              </Typography>
            </Box>
          </Paper>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-content">
          <Paper className="reset-password-card" elevation={3}>
            <Box p={4}>
              <div className="reset-password-header">
                <TwitterIcon className="reset-password-logo" />
                <Typography variant="h4" component="h1" gutterBottom>
                  Reset Password
                </Typography>
              </div>
              
              <Alert severity="error" sx={{ mb: 3 }}>
                <strong>Invalid Reset Link</strong><br />
                {error}
              </Alert>

              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  component={Link}
                  to="/forgot-password"
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: '#1da1f2',
                    borderRadius: '25px',
                    textTransform: 'none',
                    py: 1.5
                  }}
                >
                  Request New Reset Link
                </Button>
                
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderRadius: '25px',
                    textTransform: 'none',
                    py: 1.5
                  }}
                >
                  Back to Login
                </Button>
              </Box>
            </Box>
          </Paper>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-content">
        <Paper className="reset-password-card" elevation={3}>
          <Box p={4}>
            <div className="reset-password-header">
              <TwitterIcon className="reset-password-logo" />
              <Typography variant="h4" component="h1" gutterBottom>
                Reset Your Password
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Create a new password for {userEmail}
              </Typography>
            </div>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <Error fontSize="small" sx={{ mr: 1 }} />
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                <CheckCircle fontSize="small" sx={{ mr: 1 }} />
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                variant="outlined"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                variant="outlined"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Security color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />

              <Box mt={3}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    backgroundColor: '#1da1f2',
                    borderRadius: '25px',
                    textTransform: 'none',
                    py: 1.5,
                    fontSize: '16px'
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </Box>

              <Box mt={2}>
                <Button
                  component={Link}
                  to="/login"
                  variant="text"
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    color: '#1da1f2'
                  }}
                >
                  Back to Login
                </Button>
              </Box>
            </form>

            <Box mt={3} p={2} sx={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
              <Typography variant="caption" color="textSecondary">
                <strong>Password Requirements:</strong><br />
                • At least 6 characters long<br />
                • Contains uppercase and lowercase letters<br />
                • For your security, choose a unique password
              </Typography>
            </Box>
          </Box>
        </Paper>
      </div>
    </div>
  );
};

export default ResetPassword;