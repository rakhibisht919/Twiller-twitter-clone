import React, { useEffect, useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";

const useLoggedinuser = () => {
  const { user } = useUserAuth();
  const email = user?.email;
  const [loggedinuser, setloggedinuser] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      setloggedinuser([]);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/loggedinuser?email=${email}`);
        
        if (response.ok) {
          const data = await response.json();
          // Merge server data with localStorage data
          const localProfile = JSON.parse(localStorage.getItem('twiller_user_profile') || '{}');
          const mergedData = data.map(userData => ({
            ...userData,
            profileImage: localProfile.profileImage || userData.profileImage,
            coverimage: localProfile.coverimage || userData.coverimage,
            bio: localProfile.bio || userData.bio,
            location: localProfile.location || userData.location,
            website: localProfile.website || userData.website
          }));
          setloggedinuser(mergedData);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (err) {
        console.log("Server not available, using fallback user data:", err.message);
        // Get locally stored profile data
        const localProfile = JSON.parse(localStorage.getItem('twiller_user_profile') || '{}');
        
        // Provide fallback user data when server is not available, including localStorage data
        setloggedinuser([{
          name: user?.displayName || email?.split("@")[0],
          username: email?.split("@")[0],
          email: email,
          profileImage: localProfile.profileImage || user?.photoURL || null,
          coverimage: localProfile.coverimage || null,
          bio: localProfile.bio || null,
          location: localProfile.location || null,
          website: localProfile.website || null
        }]);
      } finally {
        setLoading(false);
      }
    };

    // Listen for localStorage changes
    const handleStorageChange = () => {
      fetchUserData();
    };

    fetchUserData();
    
    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [email, user]);

  return [loggedinuser, setloggedinuser, loading];
};

export default useLoggedinuser;
