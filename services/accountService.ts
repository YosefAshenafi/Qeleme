import { BASE_URL as BASE_URL_CONSTANT } from '@/config/constants';
import { getAuthToken } from '@/utils/authStorage';

const BASE_URL = `${BASE_URL_CONSTANT}/api`;

export interface DeleteAccountRequest {
  password: string;
  confirmation: boolean;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

/**
 * Delete user account via API
 * @param password - User's password for confirmation
 * @returns Promise<DeleteAccountResponse> - API response with success status and message
 */
export const deleteAccountAPI = async (password: string): Promise<DeleteAccountResponse> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const requestBody: DeleteAccountRequest = {
      password,
      confirmation: true
    };

    console.log('🗑️ Delete Account API Request:', {
      url: `${BASE_URL}/account`,
      method: 'DELETE',
      hasToken: !!token,
      confirmation: true
    });

    const response = await fetch(`${BASE_URL}/account`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Delete Account API Response Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.log('❌ Delete Account API Error Response:', errorData);
      throw new Error(errorData?.message || `Failed to delete account. Status: ${response.status}`);
    }

    const data: DeleteAccountResponse = await response.json();
    console.log('✅ Delete Account API Success Response:', data);
    
    return data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};
