import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, signInWithGoogle, signOutUser } from "./firebase";

interface AuthUser {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  points: number;
  isAdmin: boolean;
  isPremium: boolean;
  isOwner: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
      setIsLoading(true);
      
      if (firebaseUser) {
        // User is signed in, fetch user data from our backend
        console.log('Firebase user details:', {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        });
        
        try {
          const authUser = await fetchOrCreateUser(firebaseUser);
          console.log('Backend user data fetched successfully:', authUser);
          setUser(authUser);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchOrCreateUser = async (firebaseUser: User): Promise<AuthUser> => {
    try {
      // Get the Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      
      // Call our backend API with the token (same origin)
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }

      const userData = await response.json();
      
      return {
        id: userData.id,
        displayName: userData.displayName || 'Unknown User',
        email: userData.email || '',
        photoURL: firebaseUser.photoURL || undefined,
        points: userData.points || 0,
        isAdmin: userData.isAdmin || false,
        isPremium: userData.isPremium || false,
        isOwner: userData.isOwner || false
      };
    } catch (error) {
      console.error('Error fetching user from backend:', error);
      throw error;
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}