import { getAuthToken } from '@/utils/authStorage';
import { BASE_URL as BASE_URL_CONSTANT } from '@/config/constants';

const BASE_URL = `${BASE_URL_CONSTANT}/api`;

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  isChecked?: boolean;
}

export interface Chapter {
  id: string;
  name: string;
  flashcards: Flashcard[];
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface Grade {
  name: string;
  subjects: Subject[];
}

export const getFlashcards = async (): Promise<Grade[]> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await fetch(`${BASE_URL}/flashcards`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No flashcards found for this grade yet.');
      }
      
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 
        `Failed to fetch flashcards. Status: ${response.status}`
      );
    }

    const data = await response.json();
    // Convert the single grade response into an array with one grade
    return [{
      name: data.grade,
      subjects: data.subjects
    }];
  } catch (error) {
    // Use log instead of error to prevent red errors in the console
    console.log('Flashcard data not available: ', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}; 