import { BASE_URL as BASE_URL_CONSTANT } from '@/config/constants';
import { getAuthToken } from '@/features/auth/utils/authStorage';

const BASE_URL = `${BASE_URL_CONSTANT}/api`;

export interface DeleteAccountRequest {
  password: string;
  confirmation: boolean;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

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

    const response = await fetch(`${BASE_URL}/account`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });


    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to delete account. Status: ${response.status}`);
    }

    const data: DeleteAccountResponse = await response.json();
    
    return data;
  } catch (error) {
    throw error;
  }
};
