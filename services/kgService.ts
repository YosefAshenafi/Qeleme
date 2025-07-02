import { getAuthToken } from '@/utils/authStorage';
import { BASE_URL as BASE_URL_CONSTANT } from '@/config/constants';

const BASE_URL = `${BASE_URL_CONSTANT}/api`;

export interface KGCategory {
  id: number;
  name_en: string;
  name_am: string;
  image_url?: string | null;
  has_subcategories: boolean;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KGCategoriesResponse {
  success: boolean;
  data: KGCategory[];
  message?: string;
}

export interface KGSubcategory {
  id: number;
  category_id: number;
  name_en: string;
  name_am: string;
  description: string;
  image_url?: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KGSubcategoriesResponse {
  success: boolean;
  category: {
    id: number;
    name_en: string;
    name_am: string;
  };
  data: KGSubcategory[];
  message?: string;
}

/**
 * Fetch KG categories from the API
 * @returns Promise<KGCategory[]> - Array of KG categories
 */
export const getKGCategories = async (): Promise<KGCategory[]> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await fetch(`${BASE_URL}/kg/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 
        `Failed to fetch KG categories. Status: ${response.status}`
      );
    }

    const data: KGCategoriesResponse = await response.json();
    
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error('Invalid response format from server');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching KG categories:', error);
    throw error;
  }
};

/**
 * Fetch a specific KG category by ID
 * @param categoryId - The ID of the category to fetch
 * @returns Promise<KGCategory> - The category data
 */
export const getKGCategoryById = async (categoryId: number): Promise<KGCategory> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await fetch(`${BASE_URL}/kg/categories/${categoryId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 
        `Failed to fetch KG category. Status: ${response.status}`
      );
    }

    const data = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error('Invalid response format from server');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching KG category:', error);
    throw error;
  }
};

/**
 * Fetch subcategories for a specific KG category
 * @param categoryId - The ID of the category to fetch subcategories for
 * @returns Promise<{category: any, subcategories: KGSubcategory[]}> - The category and subcategories data
 */
export const getKGSubcategories = async (categoryId: number): Promise<{category: any, subcategories: KGSubcategory[]}> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await fetch(`${BASE_URL}/kg/categories/${categoryId}/subcategories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 
        `Failed to fetch KG subcategories. Status: ${response.status}`
      );
    }

    const data: KGSubcategoriesResponse = await response.json();
    
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error('Invalid response format from server');
    }

    return {
      category: data.category,
      subcategories: data.data
    };
  } catch (error) {
    console.error('Error fetching KG subcategories:', error);
    throw error;
  }
}; 