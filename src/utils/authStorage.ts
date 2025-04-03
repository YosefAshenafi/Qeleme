import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';

export interface UserData {
  id: string;
  fullName: string;
  username: string;
  type: string;
  isSelfStudent: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: UserData;
}

export const storeAuthData = async (authData: AuthResponse): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, authData.token);
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(authData.user));
  } catch (error) {
    console.error('Error storing auth data:', error);
    throw error;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const getUserData = async (): Promise<UserData | null> => {
  try {
    const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
    return userDataString ? JSON.parse(userDataString) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    return !!token;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}; 