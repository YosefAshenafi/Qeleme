import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';
const OTP_PREFIX = '@otp_';

export interface UserData {
  id: string;
  fullName: string;
  username: string;
  type: string;
  isSelfStudent: boolean;
  grade?: string;
  joinDate?: string; // ISO date string format (e.g., "2024-01-01T00:00:00.000Z")
  paymentPlan?: string;
  lastPaymentDate?: string; // ISO date string format (e.g., "2024-01-01T00:00:00.000Z")
}

export interface AuthResponse {
  message: string;
  token: string;
  user: UserData;
}

export interface OTPData {
  otp: string;
  phoneNumber: string;
  expiresAt: number; // Unix timestamp
}

export const storeAuthData = async (authData: AuthResponse): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, authData.token);
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(authData.user));
  } catch (error) {
    throw error;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    return null;
  }
};

export const getUserData = async (): Promise<UserData | null> => {
  try {
    const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
    return userDataString ? JSON.parse(userDataString) : null;
  } catch (error) {
    return null;
  }
};

export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    throw error;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    return !!token;
  } catch (error) {
    return false;
  }
};

// OTP Storage functions
export const storeOTP = async (phoneNumber: string, otp: string, expirationMinutes: number = 5): Promise<void> => {
  try {
    const expiresAt = Date.now() + (expirationMinutes * 60 * 1000);
    const otpData: OTPData = {
      otp,
      phoneNumber,
      expiresAt
    };
    
    const key = `${OTP_PREFIX}${phoneNumber}`;
    await AsyncStorage.setItem(key, JSON.stringify(otpData));
  } catch (error) {
    throw error;
  }
};

export const getStoredOTP = async (phoneNumber: string): Promise<string | null> => {
  try {
    const key = `${OTP_PREFIX}${phoneNumber}`;
    const otpDataString = await AsyncStorage.getItem(key);
    
    if (!otpDataString) {
      return null;
    }
    
    const otpData: OTPData = JSON.parse(otpDataString);
    
    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      await AsyncStorage.removeItem(key);
      return null;
    }
    
    return otpData.otp;
  } catch (error) {
    return null;
  }
};

export const clearStoredOTP = async (phoneNumber: string): Promise<void> => {
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
  } catch (error) {
    return false;
  }
}; 