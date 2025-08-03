
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  User,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import type { SignUpData, SignInData } from '@/lib/types';
import { doc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: SignInData['email'], password: SignInData['password']) => Promise<any>;
  signUp: (email: SignUpData['email'], password: SignUpData['password'], fullName: SignUpData['fullName']) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const signIn = (email: SignInData['email'], password: SignInData['password']) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: SignUpData['email'], password: SignUpData['password'], fullName: SignUpData['fullName']) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: fullName });
    
    // Save user to Firestore 'users' collection
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userDocRef, {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: fullName,
      createdAt: new Date(),
    });

    return userCredential;
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Save user to Firestore 'users' collection on first sign-in
    const userDocRef = doc(db, 'users', result.user.uid);
     await setDoc(userDocRef, {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      createdAt: new Date(),
    }, { merge: true }); // Merge to avoid overwriting existing data

    return result;
  };

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
