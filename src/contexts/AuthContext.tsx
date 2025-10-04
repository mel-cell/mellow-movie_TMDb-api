import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { tmdbService } from '../lib/api/TMDbServices';

interface User {
  id: number;
  name: string;
  username: string;
  avatar: any;
}

interface AuthContextType {
  user: User | null;
  sessionId: string | null;
  isLoading: boolean;
  login: (requestToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedSessionId = localStorage.getItem('tmdb_session_id');
      if (storedSessionId) {
        // Verify session is still valid by getting account details
        const accountDetails = await tmdbService.getAccountDetails(storedSessionId);
        setUser(accountDetails);
        setSessionId(storedSessionId);
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      // Clear invalid session
      localStorage.removeItem('tmdb_session_id');
      setUser(null);
      setSessionId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (requestToken: string) => {
    try {
      setIsLoading(true);
      const sessionResponse = await tmdbService.createSession(requestToken);

      if (sessionResponse.success) {
        const newSessionId = sessionResponse.session_id;
        localStorage.setItem('tmdb_session_id', newSessionId);
        setSessionId(newSessionId);

        // Get user details
        const accountDetails = await tmdbService.getAccountDetails(newSessionId);
        setUser(accountDetails);
      } else {
        throw new Error('Failed to create session');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (sessionId) {
        await tmdbService.deleteSession(sessionId);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state regardless of API call success
      localStorage.removeItem('tmdb_session_id');
      setUser(null);
      setSessionId(null);
    }
  };

  const value: AuthContextType = {
    user,
    sessionId,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
