import { getAuthToken } from '@/utils/authStorage';
import { BASE_URL as BASE_URL_CONSTANT } from '@/config/constants';

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
  _id: string;
  id: string;
  name: string;
  subjects: Subject[];
}

export const getMCQData = async (gradeId: string): Promise<MCQData> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    // Format the grade ID to match API expectations (e.g., "grade 6" -> "grade-6")
    const formattedGradeId = gradeId.toLowerCase().replace(/\s+/g, '-');
    console.log(`Fetching MCQ data for grade ${formattedGradeId}...`);

    const response = await fetch(`${BASE_URL}/mcqs/grade/${formattedGradeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`No MCQ data found for grade ${formattedGradeId}.`);
      }
      
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 
        `Failed to fetch MCQ data. Status: ${response.status}`
      );
    }

    // Parse the API response
    const data: MCQAPIResponse = await response.json();
    
    // Validate the response data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid API response format: Data is missing or not an object');
    }
    
    if (!data.id || !data.name) {
      throw new Error('Invalid API response format: Missing required fields (id, name)');
    }

    if (!Array.isArray(data.subjects)) {
      throw new Error('Invalid API response format: Subjects must be an array');
    }
    
    // Transform the API response to match the expected MCQData format
    const mcqData: MCQData = {
      grades: [
        {
          id: data.id,
          name: data.name,
          subjects: data.subjects
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