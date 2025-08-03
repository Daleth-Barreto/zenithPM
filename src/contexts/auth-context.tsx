
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
  deleteUser,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import type { SignUpData, SignInData } from '@/lib/types';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: SignInData['email'], password: SignInData['password']) => Promise<any>;
  signUp: (email: SignUpData['email'], password: SignUpData['password'], fullName: SignUpData['fullName']) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  deleteUserAccount: () => Promise<void>;
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
    
    // Save user to Firestore 'users' collection with lowercase email
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userDocRef, {
      uid: userCredential.user.uid,
      email: userCredential.user.email?.toLowerCase(), // Storing email in lowercase
      displayName: fullName,
      createdAt: new Date(),
    });

    return userCredential;
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Save or update user in Firestore 'users' collection with lowercase email
    const userDocRef = doc(db, 'users', result.user.uid);
     await setDoc(userDocRef, {
      uid: result.user.uid,
      email: result.user.email?.toLowerCase(), // Storing email in lowercase
      displayName: result.user.displayName,
      createdAt: new Date(),
    }, { merge: true }); // Merge to avoid overwriting existing data and to sync existing users

    return result;
  };

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  const deleteUserAccount = async () => {
    if (!auth.currentUser) {
      throw new Error("No hay un usuario autenticado para eliminar.");
    }
    const userToDelete = auth.currentUser;
    try {
      // Step 1: Delete user from Authentication
      await deleteUser(userToDelete);
      
      // Step 2: Delete user data from Firestore
      const userDocRef = doc(db, 'users', userToDelete.uid);
      await deleteDoc(userDocRef);

      // Note: This does not delete user-generated content like projects or tasks they own.
      // A more robust solution would use a Cloud Function to clean up all associated data.
      
    } catch (error: any) {
        console.error("Error al eliminar la cuenta:", error);
        // Re-throw the error so the UI can handle it (e.g., show a toast)
        if (error.code === 'auth/requires-recent-login') {
            throw new Error('auth/requires-recent-login');
        }
        throw new Error('No se pudo eliminar la cuenta.');
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    deleteUserAccount,
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
