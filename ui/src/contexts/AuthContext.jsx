import { createContext, useContext, useState, useEffect } from 'react';
import { authOperations } from '../config/firebase';
import { db } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeFirestore = null;

    // Listen for auth state changes
    const unsubscribeAuth = authOperations.onAuthStateChanged((authUser) => {
      if (authUser) {
        // Set up Firestore listener for user document
        unsubscribeFirestore = onSnapshot(
          doc(db, 'users', authUser.uid),
          (doc) => {
            if (doc.exists()) {
              // Combine auth user and Firestore data
              setUser({
                ...authUser,
                ...doc.data()
              });
            } else {
              setUser(authUser);
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching user data:', error);
            setUser(authUser);
            setLoading(false);
          }
        );
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      const user = await authOperations.signIn(email, password);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      const user = await authOperations.signUp(email, password, userData);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authOperations.signOut();
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 