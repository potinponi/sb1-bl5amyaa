import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification as sendFirebaseEmailVerification
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  emailVerified: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  sendEmailVerification: (user: User) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        setUser(user);
        setEmailVerified(user?.emailVerified || false);
        setLoading(false);
      },
      (error) => {
        console.error('Auth error:', error);
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const sendEmailVerification = async (user: User) => {
    try {
      await sendFirebaseEmailVerification(user);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      if (!user.emailVerified) {
        throw new Error('Please verify your email before logging in');
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    setError(null);
    try {
      // Create user account
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send verification email
      await sendEmailVerification(user);
      
      // Calculate trial end date (14 days from now)
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);
      
      // Store user data with trial information
      const userData = {
        email: user.email,
        created_at: new Date().toISOString(),
        trial_end: trialEnd.toISOString(),
        subscription_status: 'trial',
        email_verified: false
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      // Return the user object
      return { user };
       
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, emailVerified, signIn, signUp, signOut, sendEmailVerification }}>
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