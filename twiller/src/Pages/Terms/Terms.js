import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Typography, Box, Paper, Divider } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import '../pages.css';
import './Terms.css';

const Terms = () => {
  const navigate = useNavigate();

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
            onClick={() => navigate(-1)}
            style={{ cursor: 'pointer' }}
          />
          <div>
            <h2 className="pageTitle" style={{ margin: 0 }}>Terms of Service</h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgb(83, 100, 113)' }}>
              Effective Date: January 1, 2024
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 16px', maxWidth: '800px', margin: '0 auto' }}>
        <Paper elevation={0} style={{ padding: '24px', backgroundColor: 'transparent' }}>
          
          <section style={{ marginBottom: '32px' }}>
            <Typography variant="h5" style={{ fontWeight: '700', marginBottom: '16px', color: 'rgb(15, 20, 25)' }}>
              Welcome to Twiller
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)', marginBottom: '16px' }}>
              Thank you for using Twiller! These Terms of Service ("Terms") govern your use of Twiller, 
              a social media platform that allows you to share thoughts, connect with others, and stay 
              updated with what's happening around the world.
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)' }}>
              By accessing or using Twiller, you agree to be bound by these Terms and our community guidelines.
            </Typography>
          </section>

          <Divider style={{ margin: '24px 0' }} />

          <section style={{ marginBottom: '32px' }}>
            <Typography variant="h6" style={{ fontWeight: '700', marginBottom: '12px', color: 'rgb(15, 20, 25)' }}>
              1. User Accounts and Registration
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)', marginBottom: '12px' }}>
              • You must be at least 13 years old to create a Twiller account
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)', marginBottom: '12px' }}>
              • You are responsible for maintaining the security of your account credentials
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)' }}>
              • You must provide accurate and complete information when creating your account
            </Typography>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <Typography variant="h6" style={{ fontWeight: '700', marginBottom: '12px', color: 'rgb(15, 20, 25)' }}>
              2. Content and Conduct
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)', marginBottom: '12px' }}>
              • You retain ownership of the content you post on Twiller
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)', marginBottom: '12px' }}>
              • You grant Twiller a license to use, display, and distribute your content on the platform
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)', marginBottom: '12px' }}>
              • You agree not to post content that is illegal, harmful, or violates others' rights
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)' }}>
              • Harassment, hate speech, and spam are strictly prohibited
            </Typography>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <Typography variant="h6" style={{ fontWeight: '700', marginBottom: '12px', color: 'rgb(15, 20, 25)' }}>
              3. Privacy and Data Protection
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)', marginBottom: '12px' }}>
              • We collect and process your data in accordance with applicable privacy laws
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)', marginBottom: '12px' }}>
              • You can control your privacy settings through your account preferences
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)' }}>
              • We do not sell your personal information to third parties
            </Typography>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <Typography variant="h6" style={{ fontWeight: '700', marginBottom: '12px', color: 'rgb(15, 20, 25)' }}>
              4. Intellectual Property
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)', marginBottom: '12px' }}>
              • The Twiller platform, including its design and functionality, is our intellectual property
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)', marginBottom: '12px' }}>
              • You may not copy, modify, or distribute our platform without permission
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)' }}>
              • Respect the intellectual property rights of other users and third parties
            </Typography>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <Typography variant="h6" style={{ fontWeight: '700', marginBottom: '12px', color: 'rgb(15, 20, 25)' }}>
              5. Service Availability and Modifications
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)', marginBottom: '12px' }}>
              • Twiller is provided "as is" and we make no guarantees about service availability
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)', marginBottom: '12px' }}>
              • We may modify, suspend, or discontinue the service at any time
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)' }}>
              • We will provide reasonable notice for significant changes to the service
            </Typography>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <Typography variant="h6" style={{ fontWeight: '700', marginBottom: '12px', color: 'rgb(15, 20, 25)' }}>
              6. Termination
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)', marginBottom: '12px' }}>
              • You may delete your account at any time through your account settings
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)', marginBottom: '12px' }}>
              • We may suspend or terminate accounts that violate these Terms
            </Typography>
            <Typography variant="body1" style={{ lineHeight: '1.6', color: 'rgb(83, 100, 113)' }}>
              • Upon termination, your access to the service will be discontinued
            </Typography>
          </section>


          <Box style={{ 
            backgroundColor: 'rgb(247, 249, 249)', 
            padding: '16px', 
            borderRadius: '8px',
            marginTop: '24px' 
          }}>
            <Typography variant="body2" style={{ 
              color: 'rgb(83, 100, 113)', 
              fontStyle: 'italic',
              textAlign: 'center' 
            }}>
              These Terms of Service were last updated on January 1, 2024. 
              We may update these terms from time to time, and will notify users of significant changes.
            </Typography>
          </Box>

        </Paper>
      </div>
    </div>
  );
};

export default Terms;