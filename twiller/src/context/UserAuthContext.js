import { createContext, useContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updatePassword as firebaseUpdatePassword,
    deleteUser,
} from "firebase/auth";
import { auth } from "./firbase";

const userAuthContext = createContext();

export function UserAuthContextProvider(props) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    function logIn(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }
    
    function signUp(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }
    
    function logOut() {
        return signOut(auth);
    }
    
    // Google Sign-In implementation using popup
    async function googleSignIn() {
        console.log('Attempting Google Sign-In with popup...');
        
        try {
            const provider = new GoogleAuthProvider();
            
            // Configure provider
            provider.addScope('email');
            provider.addScope('profile');
            
            // Force account selection every time
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            
            // Use popup method for immediate results
            const result = await signInWithPopup(auth, provider);
            console.log('Google Sign-In successful:', result.user?.email);
            
            return result; // Return the result immediately
            
        } catch (error) {
            console.error('Google Sign-In failed:', {
                code: error.code,
                message: error.message
            });
            
            // Handle specific errors
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    throw new Error('Sign-in was cancelled.');
                    
                case 'auth/popup-blocked':
                    throw new Error('Pop-up blocked. Please allow pop-ups and try again.');
                    
                case 'auth/unauthorized-domain':
                case 'auth/operation-not-allowed':
                    throw new Error('Google Sign-In is not properly configured.');
                    
                case 'auth/invalid-api-key':
                    throw new Error('Authentication service is temporarily unavailable.');
                    
                case 'auth/network-request-failed':
                    throw new Error('Network error. Please check your connection.');
                    
                default:
                    console.error('Unexpected error:', error);
                    throw new Error(`Sign-in failed: ${error.message || 'Please try again'}`);
            }
        }
    }

    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }
    
    // Function to update user password directly (for generated password flow)
    function updateUserPassword(user, newPassword) {
        return firebaseUpdatePassword(user, newPassword);
    }
    
    // Function to permanently delete the user account from Firebase
    function deleteAccount() {
        const currentUser = auth.currentUser;
        if (currentUser) {
            return deleteUser(currentUser);
        }
        return Promise.reject(new Error("No user is currently signed in"));
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentuser) => {
            console.log("Auth state changed:", currentuser);
            setUser(currentuser);
            setLoading(false);
        });
        
        return () => unsubscribe();
    }, []);

    return (
        <userAuthContext.Provider
            value={{ user, loading, logIn, signUp, logOut, googleSignIn, resetPassword, updateUserPassword, deleteAccount }}
        >
            {props.children}
        </userAuthContext.Provider>
    );
}

export function useUserAuth() {
    return useContext(userAuthContext);
}