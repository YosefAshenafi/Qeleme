import { getAuthToken } from '@/utils/authStorage';
import { BASE_URL as BASE_URL_CONSTANT } from '@/config/constants';
import pictureMCQData from '@/data/pictureMCQData.json';

const BASE_URL = `${BASE_URL_CONSTANT}/api`;

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number | string;
  question: string;
  options: Option[];
  explanation: string;
  isChecked?: boolean; // Added to match API response
}

export interface Chapter {
  id: string;
  name: string;
  questions: Question[];
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface Grade {
  id: string;
  name: string;
  subjects: Subject[];
  isNationalExam?: boolean;
}

export type ExamType = 'national' | 'mcq';

export interface MCQData {
  grades: Grade[];
}

// Interface that matches the exact API response format
interface MCQAPIResponse {
  id: number;
  question: string;
  options: {
    id: number;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  subjectId: number;
  chapterId: number;
  gradeLevelId: number;
}

export const getMCQData = async (gradeId: string): Promise<MCQData> => {
  try {
    // Format the grade ID to match API expectations (e.g., "grade 6" -> "grade-6")
    const formattedGradeId = gradeId.toLowerCase().replace(/\s+/g, '-');
    console.log(`Fetching MCQ data for grade ${formattedGradeId}...`);

    // For Kindergarten, use the local picture MCQ data without authentication
    if (formattedGradeId === 'grade-kg') {
      console.log('Using local picture MCQ data for Kindergarten');
      return pictureMCQData;
    }

    // For other grades, require authentication
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    // Extract just the number from the grade ID (e.g., "grade-5" -> "5")
    const gradeNumber = formattedGradeId.split('-')[1];
    
    // Use the correct API endpoint format with gradeLevelId
    const response = await fetch(`${BASE_URL}/mcq?gradeLevelId=${gradeNumber}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    let rawData: any;
    try {
      rawData = await response.json();
    } catch (jsonErr) {
      // If response is not JSON, show a user-friendly error
      throw new Error('Server returned invalid data. Please try again later.');
    }

    // Log the raw API response for debugging
    console.log('Raw MCQ API response:', JSON.stringify(rawData, null, 2));
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`No MCQ data found for grade ${formattedGradeId}.`);
      }
      // Use the already-read rawData for error message
      const errorMsg = rawData?.message || rawData?.error || `Failed to fetch MCQ data. Status: ${response.status}`;
      throw new Error(errorMsg);
    }

    // If the response is not an object or doesn't have the expected structure
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      console.error('Invalid response type:', typeof rawData);
      throw new Error('Server returned invalid data type. Please try again later.');
    }

    // The server returns an array with a single object containing the grades
    const mcqData = rawData[0];
    if (!mcqData.grades) {
      console.error('Missing grades in response:', mcqData);
      throw new Error('Server response missing grades data. Please try again later.');
    }

    // The server response matches our MCQData format, so we can return it directly
    return mcqData as MCQData;
  } catch (error) {
    console.log('MCQ data not available: ', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}; 