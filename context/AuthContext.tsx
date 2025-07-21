'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type UserRole = 'admin' | 'teacher' | 'parent' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  school?: string;
  class?: string;
  subjects?: string[];
  children?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('daara_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // Mock authentication - in real app, this would call your API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock users for demonstration
    const mockUsers: Record<string, User> = {
      'admin@daara.com': {
        id: '1',
        email: 'admin@daara.com',
        name: 'Admin User',
        role: 'admin',
        school: 'Daara High School'
      },
      'teacher@daara.com': {
        id: '2',
        email: 'teacher@daara.com',
        name: 'Sarah Johnson',
        role: 'teacher',
        school: 'Daara High School',
        subjects: ['Mathematics', 'Physics']
      },
      'parent@daara.com': {
        id: '3',
        email: 'parent@daara.com',
        name: 'Michael Brown',
        role: 'parent',
        children: ['Emma Brown', 'James Brown']
      },
      'student@daara.com': {
        id: '4',
        email: 'student@daara.com',
        name: 'Emma Brown',
        role: 'student',
        school: 'Daara High School',
        class: 'Grade 10-A'
      }
    };

    const foundUser = mockUsers[email];
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('daara_user', JSON.stringify(foundUser));
    } else {
      throw new Error('Invalid credentials');
    }
    
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('daara_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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