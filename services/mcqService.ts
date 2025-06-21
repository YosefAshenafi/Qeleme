import { getAuthToken } from '@/utils/authStorage';
import { BASE_URL as BASE_URL_CONSTANT } from '@/config/constants';
import kgMCQData from '@/data/kgMCQData.json';

const BASE_URL = `${BASE_URL_CONSTANT}/api`;

export interface Option {
  id: string | number;
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

// Interface for National Exam API response
export interface NationalExamAPIResponse {
  id: number;
  question: string;
  options: {
    id: number;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  subjectId: number;
  yearId: number;
  gradeLevelId: number;
}

// Interface for National Exam Available API response
interface NationalExamAvailableResponse {
  data: {
    subjects: string[];
    years: number[];
  };
  success: boolean;
}

export const getMCQData = async (gradeId: string): Promise<MCQData> => {
  try {
    // Format the grade ID to match API expectations (e.g., "grade 6" -> "grade-6")
    const formattedGradeId = gradeId.toLowerCase().replace(/\s+/g, '-');

    // For Kindergarten, use the local picture MCQ data without authentication
    if (formattedGradeId === 'grade-kg') {
      return kgMCQData;
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
      throw new Error('Server returned invalid data type. Please try again later.');
    }

    // The server returns an array with a single object containing the grades
    const mcqData = rawData[0];
    if (!mcqData.grades) {
      throw new Error('Server response missing grades data. Please try again later.');
    }

    // The server response matches our MCQData format, so we can return it directly
    return mcqData as MCQData;
  } catch (error) {
    throw error;
  }
};

// Function to fetch National Exam questions
export const getNationalExamQuestions = async (
  gradeLevelId: number,
  yearId: number,
  subject: string
): Promise<NationalExamAPIResponse[]> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await fetch(
      `${BASE_URL}/questions/grouped?gradeLevelId=${gradeLevelId}&yearId=${yearId}&subject=${encodeURIComponent(subject)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to fetch national exam questions');
    }
    
    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('No questions found for this exam');
    }

    const examGroup = data.data[0];
    if (!examGroup.questions || !Array.isArray(examGroup.questions)) {
      throw new Error('Invalid questions format in response');
    }

    // Transform the questions to match the expected format
    const transformedQuestions = examGroup.questions.map((q: any) => ({
      id: q._id || q.id,
      question: q.question,
      options: q.options.map((opt: any) => ({
        id: opt._id || opt.id,
        text: opt.text,
        isCorrect: opt.isCorrect
      })),
      explanation: q.explanation || '',
      subjectId: examGroup.subject,
      yearId: examGroup.year,
      gradeLevelId: examGroup.gradeLevel
    }));

    return transformedQuestions;
  } catch (error) {
    throw error;
  }
};

// Function to fetch available subjects and years for national exams
export const getNationalExamAvailable = async (gradeNumber: number): Promise<NationalExamAvailableResponse> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    // Ensure gradeNumber is a valid number
    const validGrade = Number(gradeNumber);
    if (![6, 8, 12].includes(validGrade)) {
      throw new Error('Invalid grade level. Must be 6, 8, or 12');
    }

    const response = await fetch(`${BASE_URL}/national-exams/available/${validGrade}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to fetch available national exam data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to fetch regular MCQ questions
export const getRegularMCQQuestions = async (
  gradeLevelId: number,
  subjectId: string,
  chapterId: string
): Promise<NationalExamAPIResponse[]> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await fetch(
      `${BASE_URL}/mcq/grouped?gradeLevelId=${gradeLevelId}&subjectId=${encodeURIComponent(subjectId)}&chapterId=${encodeURIComponent(chapterId)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to fetch MCQ questions');
    }
    
    const data = await response.json();
    
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error('No questions found for this exam');
    }

    // Transform the questions to match the expected format
    const transformedQuestions = data.questions.map((q: any) => ({
      id: q.id,
      question: q.question,
      options: q.options.map((opt: any) => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.isCorrect
      })),
      explanation: q.explanation || '',
      subjectId: data.subject,
      gradeLevelId: data.grade,
      chapterId: data.chapter
    }));

    return transformedQuestions;
  } catch (error) {
    throw error;
  }
}; 