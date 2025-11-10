import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// A simple interface for our user object
interface User {
  uid: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
  joinedCharts: string[]; // Array of shareCodes for charts the user has joined/created
}

interface AuthContextType {
  user: User | null;
  loginWithGoogle: () => void; // This will be our placeholder
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
  };

  const logout = () => {
    signOut(auth).catch(error => console.error("Error during sign-out:", error));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        getDoc(userRef).then(docSnap => {
          if (docSnap.exists()) {
            // Existing user, set user data from Firestore, ensuring joinedCharts is an array
            setUser(docSnap.data() as User);
          } else {
            // New user, create a document in Firestore
            const { displayName, email, photoURL, uid } = firebaseUser;
            const nameParts = displayName?.split(" ") || [];
            const firstName = nameParts[0] || null;
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

            const newUser: User = {
              uid,
              firstName,
              lastName,
              displayName,
              email,
              photoURL,
              joinedCharts: [], // Initialize as empty array for new users
            };

            setDoc(userRef, newUser)
              .then(() => setUser(newUser))
              .catch(error => console.error("Error creating user document:", error));
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = { user, loginWithGoogle, logout, setUser };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}