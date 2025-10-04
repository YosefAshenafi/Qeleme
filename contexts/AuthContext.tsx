import { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { getUserData, isAuthenticated as checkAuthState, clearAuthData, UserData } from '@/utils/authStorage';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  isLoading: boolean;
  login: (userData: UserData) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication data on app start
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
      // Silently handle auth state check error
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: UserData) => {
    try {
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      // Silently handle auth state update error
    }
  };

  const logout = async () => {
    try {
      await clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/(auth)/login');
    } catch (error) {
      // Silently handle logout error
    }
  };

  const deleteAccount = async () => {
    try {
      // Clear all user data
      await clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate to onboarding after account deletion
      router.replace('/(auth)/onboarding');
    } catch (error) {
      // Silently handle delete account error
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