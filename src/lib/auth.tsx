'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { users } from '@/lib/data';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => User | null;
  logout: () => void;
  signup: (name: string, email: string, password: string) => User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Mock session management using localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const foundUser = users.find(u => u.id === storedUserId) || null;
      setUser(foundUser);
    }
    setLoading(false);
  }, []);

  const login = (username: string, password: string): User | null => {
    setLoading(true);
    const foundUser = users.find(u => u.id === username && u.password === password);
    if (foundUser) {
      localStorage.setItem('userId', foundUser.id);
      setUser(foundUser);
      router.push('/dashboard');
      setLoading(false);
      return foundUser;
    }
    setLoading(false);
    return null;
  };

  const logout = () => {
    setLoading(true);
    localStorage.removeItem('userId');
    setUser(null);
    router.push('/login');
    setLoading(false);
  };

  const signup = (name: string, email: string, password: string): User | null => {
    setLoading(true);
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        setLoading(false);
        return null; // User already exists
    }

    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        avatar: `https://picsum.photos/seed/${name}/100/100`,
        role: 'user',
    };
    
    users.push(newUser); // In a real app, this would be a DB call
    localStorage.setItem('userId', newUser.id);
    setUser(newUser);
    router.push('/dashboard');
    setLoading(false);
    return newUser;
  };

  const value = { user, loading, login, logout, signup };

  if (loading) {
     return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
     )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
