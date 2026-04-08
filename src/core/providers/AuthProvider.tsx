import { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import {
  clearAuthData,
  getUserData,
  isAuthenticated as checkAuthState,
  storeUserData,
  type UserData,
} from '@/features/auth/utils/authStorage';
import { deleteAccountAPI } from '@/features/auth/services/accountService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  isLoading: boolean;
  login: (userData: UserData) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    
    checkAuthStateOnStart();
  }, []);

  const checkAuthStateOnStart = async () => {
    try {
      const isAuth = await checkAuthState();
      if (isAuth) {
        const userData = await getUserData();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: UserData) => {
    try {
      await storeUserData(userData);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
    }
  };

  const logout = async () => {
    try {
      await clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/(auth)/login');
    } catch (error) {
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      
      const result = await deleteAccountAPI(password);
      
      if (result.success) {
        
        await clearAuthData();
        setUser(null);
        setIsAuthenticated(false);
        
        
        router.replace('/(auth)/onboarding');
      } else {
        throw new Error(result.message || 'Failed to delete account');
      }
    } catch (error) {
      
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout, deleteAccount }}>
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
