import { getAuthToken } from '@/utils/authStorage';
import { BASE_URL as BASE_URL_CONSTANT } from '@/config/constants';

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

    // For Kindergarten, we'll handle this differently - we'll use the API for specific categories
    if (formattedGradeId === 'grade-kg') {
      // Return a placeholder structure that will be handled by the KG-specific components
      return {
        grades: [{
          id: 'grade-kg',
          name: 'Kindergarten',
          subjects: [{
            id: 'general',
            name: 'General Knowledge',
            chapters: []
          }]
        }]
      };
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
  console.log('=== getRegularMCQQuestions DEBUG ===');
  console.log('📊 Input Parameters:', { gradeLevelId, subjectId, chapterId });
  
  try {
    const token = await getAuthToken();
    console.log('🔑 Token Status:', token ? '✅ Token found' : '❌ No token found');
    console.log('🔑 Token Preview:', token ? `${token.substring(0, 20)}...` : 'No token');
    
    if (!token) {
      console.log('❌ Authentication failed - no token');
      throw new Error('No authentication token found. Please login again.');
    }

    const url = `${BASE_URL}/questions/grouped?gradeLevelId=${gradeLevelId}&subjectId=${encodeURIComponent(subjectId)}&chapterId=${encodeURIComponent(chapterId)}`;
    console.log('🌐 API URL:', url);
    console.log('📤 Request Headers:', {
      'Authorization': `Bearer ${token.substring(0, 20)}...`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response OK:', response.ok);
    console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.log('❌ API Error Response:', errorData);
      throw new Error(errorData?.message || 'Failed to fetch MCQ questions');
    }
    
    const data = await response.json();
    console.log('📥 Raw API Response:', JSON.stringify(data, null, 2));
    
    // Handle the actual API response structure
    if (!data.subjects || typeof data.subjects !== 'object') {
      console.log('❌ No subjects object in response');
      throw new Error('No questions found for this exam');
    }

    // Find the subject data
    const subjectKey = Object.keys(data.subjects)[0];
    if (!subjectKey) {
      console.log('❌ No subject found in response');
      throw new Error('No questions found for this exam');
    }

    const subjectData = data.subjects[subjectKey];
    console.log('📊 Subject Data:', subjectData);
    
    if (!subjectData.questions || !Array.isArray(subjectData.questions)) {
      console.log('❌ No questions array in subject data');
      throw new Error('Invalid questions format in response');
    }

    console.log('📊 Questions Count:', subjectData.questions.length);

    // Transform the questions to match the expected format
    const transformedQuestions = subjectData.questions.map((q: any, index: number) => {
      console.log(`📝 Question ${index + 1}:`, {
        id: q.id,
        question: q.question?.substring(0, 50) + '...',
        optionsCount: q.options?.length || 0,
        correctAnswer: q.correctAnswer
      });
      
      // Transform options to include isCorrect property
      const options = q.options.map((opt: string, optIndex: number) => ({
        id: String.fromCharCode(65 + optIndex), // A, B, C, D...
        text: opt,
        isCorrect: q.correctAnswer === String.fromCharCode(65 + optIndex)
      }));
      
      return {
        id: q.id,
        question: q.question,
        options: options,
        explanation: q.explanations || '',
        subjectId: subjectKey,
        gradeLevelId: gradeLevelId,
        chapterId: chapterId
      };
    });

    console.log('✅ Transformed Questions Count:', transformedQuestions.length);
    console.log('=== END getRegularMCQQuestions DEBUG ===');
    return transformedQuestions;
  } catch (error) {
    console.error('❌ getRegularMCQQuestions Error:', error);
    console.log('=== END getRegularMCQQuestions DEBUG (ERROR) ===');
    throw error;
  }
}; 