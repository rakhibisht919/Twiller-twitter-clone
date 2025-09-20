import { db } from '../context/firbase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';

// Collection names
const COLLECTIONS = {
  POSTS: 'posts',
  USERS: 'users'
};

// Check if backend is available
export const checkBackendAvailability = async () => {
  try {
    const response = await fetch('http://localhost:5001/health', { 
      method: 'GET',
      timeout: 3000 
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Firebase fallback functions for posts
export const createPostFirebase = async (postData) => {
  if (!db) throw new Error('Firestore not initialized');
  
  const postWithTimestamp = {
    ...postData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, COLLECTIONS.POSTS), postWithTimestamp);
  return { id: docRef.id, ...postWithTimestamp };
};

export const getPostsFirebase = async (limitCount = 20) => {
  if (!db) throw new Error('Firestore not initialized');
  
  const q = query(
    collection(db, COLLECTIONS.POSTS),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  const posts = [];
  
  querySnapshot.forEach((doc) => {
    posts.push({ id: doc.id, ...doc.data() });
  });
  
  return posts;
};

// Firebase fallback functions for user data
export const getUserDataFirebase = async (email) => {
  if (!db) throw new Error('Firestore not initialized');
  
  const userDocRef = doc(db, COLLECTIONS.USERS, email);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    return [userDoc.data()];
  } else {
    // Return default user data if not found
    return [{
      email: email,
      name: email.split('@')[0],
      username: email.split('@')[0],
      profileImage: null
    }];
  }
};

export const setUserDataFirebase = async (email, userData) => {
  if (!db) throw new Error('Firestore not initialized');
  
  const userDocRef = doc(db, COLLECTIONS.USERS, email);
  const userWithTimestamp = {
    ...userData,
    email: email,
    updatedAt: serverTimestamp()
  };
  
  await setDoc(userDocRef, userWithTimestamp, { merge: true });
  return userWithTimestamp;
};

// Hybrid function that tries backend first, falls back to Firebase
export const createPostHybrid = async (postData) => {
  try {
    // Try backend first
    const response = await fetch("http://localhost:5001/post", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Backend failed");
    }
  } catch (error) {
    console.log("Backend not available, using Firebase:", error.message);
    // Fallback to Firebase
    return await createPostFirebase(postData);
  }
};

export const getPostsHybrid = async () => {
  try {
    // Try backend first
    const response = await fetch("http://localhost:5001/post");
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Backend failed");
    }
  } catch (error) {
    console.log("Backend not available, using Firebase:", error.message);
    // Fallback to Firebase
    return await getPostsFirebase();
  }
};

export const getUserDataHybrid = async (email) => {
  try {
    // Try backend first
    const response = await fetch(`http://localhost:5001/loggedinuser?email=${email}`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Backend failed");
    }
  } catch (error) {
    console.log("Backend not available, using Firebase:", error.message);
    // Fallback to Firebase
    return await getUserDataFirebase(email);
  }
};