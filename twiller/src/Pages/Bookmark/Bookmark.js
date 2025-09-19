import React, { useState, useEffect } from 'react'
import '../pages.css'
import Post from '../Feed/Posts/Posts'
import { useUserAuth } from '../../context/UserAuthContext'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'

const Bookmark = () => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useUserAuth()
  const navigate = useNavigate()
  const currentUserId = user?.email || user?.uid

  useEffect(() => {
    const loadBookmarks = () => {
      if (currentUserId) {
        const bookmarks = JSON.parse(localStorage.getItem(`bookmarked_posts_${currentUserId}`) || '[]')
        setBookmarkedPosts(bookmarks)
      }
      setLoading(false)
    }

    loadBookmarks()

    // Listen for storage changes to update bookmarks in real-time
    const handleStorageChange = (e) => {
      if (e.key === `bookmarked_posts_${currentUserId}`) {
        loadBookmarks()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [currentUserId])

  const handleClearBookmarks = () => {
    if (window.confirm('Are you sure you want to clear all bookmarks?')) {
      localStorage.setItem(`bookmarks_${currentUserId}`, JSON.stringify([]))
      localStorage.setItem(`bookmarked_posts_${currentUserId}`, JSON.stringify([]))
      setBookmarkedPosts([])
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="pageHeader" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px',
          borderBottom: '1px solid rgb(239, 243, 244)',
          position: 'sticky',
          top: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          zIndex: 10
        }}>
          <ArrowBackIcon 
            className="arrow-icon" 
            onClick={() => navigate('/')} 
            style={{ cursor: 'pointer' }}
          />
          <div>
            <h2 className="pageTitle" style={{ margin: 0 }}>Bookmarks</h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgb(83, 100, 113)' }}>
              @{user?.email?.split('@')[0] || 'user'}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading bookmarks...</div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="pageHeader" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        padding: '16px', 
        borderBottom: '1px solid rgb(239, 243, 244)',
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        zIndex: 10
      }}>
        <ArrowBackIcon 
          className="arrow-icon" 
          onClick={() => navigate('/')} 
          style={{ cursor: 'pointer' }}
        />
        <div>
          <h2 className="pageTitle" style={{ margin: 0 }}>Bookmarks</h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgb(83, 100, 113)' }}>
            @{user?.email?.split('@')[0] || 'user'}
          </p>
        </div>
      </div>
      
      {bookmarkedPosts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 40px',
          color: 'rgb(83, 100, 113)'
        }}>
          <h3 style={{ fontSize: '31px', fontWeight: '800', marginBottom: '8px' }}>
            Save posts for later
          </h3>
          <p style={{ fontSize: '15px', lineHeight: '20px', maxWidth: '380px', margin: '0 auto' }}>
            Bookmark posts to easily find them again in the future.
          </p>
        </div>
      ) : (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid rgb(239, 243, 244)'
          }}>
            <span style={{ fontSize: '15px', color: 'rgb(83, 100, 113)' }}>
              {bookmarkedPosts.length} bookmark{bookmarkedPosts.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={handleClearBookmarks}
              style={{
                background: 'none',
                border: '1px solid rgb(207, 217, 222)',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '13px',
                color: 'rgb(15, 20, 25)',
                cursor: 'pointer',
                fontWeight: '700'
              }}
            >
              Clear all
            </button>
          </div>
          <div>
            {bookmarkedPosts.map((post, index) => (
              <Post key={`${post._id}-${index}`} p={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Bookmark
