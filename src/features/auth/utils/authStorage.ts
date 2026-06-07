import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';
const OTP_PREFIX = '@otp_';

const isWeb = typeof window !== 'undefined' && !window.navigator?.product;

export interface UserData {
  id: string;
  fullName: string;
  username: string;
  type: string;
  isSelfStudent: boolean;
  grade?: string;
  joinDate?: string;
  paymentPlan?: string;
  lastPaymentDate?: string;
  phoneNumber?: string;
  profileImage?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: UserData;
}

export interface OTPData {
  otp: string;
  phoneNumber: string;
  expiresAt: number;
}

const webTokenStorage = {
  getItem: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
  setItem: (value: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_TOKEN_KEY, value);
  },
  removeItem: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },
};

const mobileTokenStorage = {
  async getItem() {
    try {
      return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    } catch {
      return AsyncStorage.getItem(AUTH_TOKEN_KEY);
    }
  },
  async setItem(value: string) {
    try {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, value);
      return;
    } catch {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, value);
    }
  },
  async removeItem() {
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    } catch {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    }
  },
};

const tokenStorage = isWeb ? webTokenStorage : mobileTokenStorage;

export const storeAuthData = async (authData: AuthResponse): Promise<void> => {
  try {
    await tokenStorage.setItem(authData.token);
    await storeUserData(authData.user);
  } catch (error) {
    throw error;
  }
};

export const storeUserData = async (userData: UserData): Promise<void> => {
  if (isWeb) {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    return;
  }
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    throw error;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  if (isWeb) {
    return webTokenStorage.getItem();
  }
  try {
    return await tokenStorage.getItem();
  } catch {
    return null;
  }
};

export const getUserData = async (): Promise<UserData | null> => {
  if (isWeb) {
    const userDataString = localStorage.getItem(USER_DATA_KEY);
    return userDataString ? JSON.parse(userDataString) : null;
  }
  try {
    const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
    return userDataString ? JSON.parse(userDataString) : null;
  } catch {
    return null;
  }
};

export const clearAuthData = async (): Promise<void> => {
  if (isWeb) {
    webTokenStorage.removeItem();
    localStorage.removeItem(USER_DATA_KEY);
    return;
  }
  try {
    await tokenStorage.removeItem();
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    throw error;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    return !!token;
  } catch {
    return false;
  }
};

export const storeOTP = async (phoneNumber: string, otp: string, expirationMinutes: number = 5): Promise<void> => {
  const expiresAt = Date.now() + (expirationMinutes * 60 * 1000);
  const otpData: OTPData = {
    otp,
    phoneNumber,
    expiresAt
  };
  
  if (isWeb) {
    localStorage.setItem(`${OTP_PREFIX}${phoneNumber}`, JSON.stringify(otpData));
    return;
  }
  
  try {
    const key = `${OTP_PREFIX}${phoneNumber}`;
    await AsyncStorage.setItem(key, JSON.stringify(otpData));
  } catch (error) {
    throw error;
  }
};

export const getStoredOTP = async (phoneNumber: string): Promise<string | null> => {
  if (isWeb) {
    const key = `${OTP_PREFIX}${phoneNumber}`;
    const otpDataString = localStorage.getItem(key);
    if (!otpDataString) return null;
    
    const otpData: OTPData = JSON.parse(otpDataString);
    if (Date.now() > otpData.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return otpData.otp;
  }
  
  try {
    const key = `${OTP_PREFIX}${phoneNumber}`;
    const otpDataString = await AsyncStorage.getItem(key);
    
    if (!otpDataString) return null;
    
    const otpData: OTPData = JSON.parse(otpDataString);
    
    if (Date.now() > otpData.expiresAt) {
      await AsyncStorage.removeItem(key);
      return null;
    }
    
    return otpData.otp;
  } catch {
    return null;
  }
};

export const clearStoredOTP = async (phoneNumber: string): Promise<void> => {
  if (isWeb) {
    localStorage.removeItem(`${OTP_PREFIX}${phoneNumber}`);
    return;
  }
  
  try {
    const key = `${OTP_PREFIX}${phoneNumber}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    throw error;
  }
};

export const isOTPValid = async (phoneNumber: string, otp: string): Promise<boolean> => {
  try {
    const storedOTP = await getStoredOTP(phoneNumber);
    return storedOTP === otp;
  } catch {
    return false;
  }
};
