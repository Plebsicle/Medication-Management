import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Define the JWT payload type
interface JwtPayload {
  userId?: number;
  id?: number;
  sub?: number;
  name?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;  // For any other fields in the JWT
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt');
    setUser(null);
  }, []);

  const getUserData = useCallback(() => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('jwt');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Parse token if it's stored as a JSON string
        const parsedToken = token.startsWith('"') ? JSON.parse(token) : token;
        const decoded = jwtDecode<JwtPayload>(parsedToken);
        
        // Map JWT fields to our User interface
        const userData: User = {
          id: decoded.userId || decoded.id || decoded.sub || 0,
          name: decoded.name || '',
          email: decoded.email || '',
          role: decoded.role || ''
        };
        
        // Ensure all required fields are present
        if (userData.id && userData.name && userData.email && userData.role) {
          setUser(userData);
        } else {
          console.error('Missing required user fields in JWT, clearing auth data');
          logout();
        }
      } catch (err) {
        console.error('Failed to decode JWT:', err);
        logout();
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const refreshUserData = useCallback(() => {
    setLoading(true);
    getUserData();
  }, [getUserData]);

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
