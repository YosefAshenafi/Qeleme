import { getAuthToken } from '@/utils/authStorage';

const BASE_URL = 'http://localhost:5001/api';

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
}

export interface MCQData {
  grades: Grade[];
}

// Interface that matches the exact API response format
interface MCQAPIResponse {
  grade: string;
  subjects: Subject[];
}

export const getMCQData = async (): Promise<MCQData> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    console.log('Fetching MCQ data...');

    const response = await fetch(`${BASE_URL}/mcq`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No MCQ data found for your grade.');
      }
      
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 
        `Failed to fetch MCQ data. Status: ${response.status}`
      );
    }

    // Parse the API response
    const data = await response.json();
    
    // Validate the response data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid API response format: Data is missing or not an object');
    }
    
    if (!data.grade) {
      console.warn('API response missing grade. Using default "Grade 1"');
    }

    if (!Array.isArray(data.subjects)) {
      console.warn('API response missing subjects array or subjects is not an array');
    }
    
    // Ensure we have valid data before proceeding
    const grade = data.grade || 'Grade 1';
    const subjects = Array.isArray(data.subjects) ? data.subjects : [];
    
    // Extract grade number from the grade string (e.g., "Grade 5" -> "5")
    const gradeMatch = grade.match(/\d+/);
    const gradeNumber = gradeMatch ? gradeMatch[0] : '1';
    
    // Transform the API response to match the expected MCQData format
    const mcqData: MCQData = {
      grades: [
        {
          id: `grade-${gradeNumber}`,
          name: grade,
          subjects: subjects
        }
      ]
    };
    
    // Log the transformed data structure
    console.log('Transformed MCQ data:', JSON.stringify({
      gradeId: mcqData.grades[0].id,
      gradeName: mcqData.grades[0].name,
      subjectCount: mcqData.grades[0].subjects.length,
      subjects: mcqData.grades[0].subjects.map(s => ({
        id: s.id,
        name: s.name,
        chapterCount: s.chapters?.length || 0
      }))
    }, null, 2));
    
    return mcqData;
  } catch (error) {
    console.log('MCQ data not available: ', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}; 