import { getAuthToken } from '@/features/auth/utils/authStorage';
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
  image_url?: string; 
  isChecked?: boolean; 
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

export type ExamType = 'national' | 'practice';

export interface PracticeData {
  grades: Grade[];
}

export interface NationalExamAPIResponse {
  id: number;
  question: string;
  options: {
    id: number;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  image_url?: string; 
  subjectId: number;
  yearId: number;
  gradeLevelId: number;
}

interface NationalExamAvailableResponse {
  data: {
    subjects: string[];
    years: number[];
  };
  success: boolean;
}

export const getPracticeData = async (gradeId: string): Promise<PracticeData> => {
  try {
    
    const formattedGradeId = gradeId.toLowerCase().replace(/\s+/g, '-');

    
    if (formattedGradeId === 'grade-kg') {
      
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

    
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const gradeNumber = formattedGradeId.split('-')[1];

    const response = await fetch(`${BASE_URL}/mcq?gradeLevelId=${gradeNumber}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    

    let rawData: any;
    try {
      rawData = await response.json();
    } catch (jsonErr) {
      
      throw new Error('Server returned invalid data. Please try again later.');
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`No practice content found for grade ${formattedGradeId}.`);
      }
      
      const errorMsg = rawData?.message || rawData?.error || `Failed to fetch practice data. Status: ${response.status}`;
      throw new Error(errorMsg);
    }

    
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('Server returned invalid data type. Please try again later.');
    }

    
    const payload = rawData[0];
    if (!payload.grades) {
      throw new Error('Server response missing grades data. Please try again later.');
    }

    return payload as PracticeData;
  } catch (error) {
    throw error;
  }
};

const getCorrectAnswerIndex = (correctAnswer: string): number => {
  const letter = correctAnswer.toUpperCase();
  switch (letter) {
    case 'A': return 0;
    case 'B': return 1;
    case 'C': return 2;
    case 'D': return 3;
    default: return 0;
  }
};

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
      `${BASE_URL}/national-exams/grouped?gradeLevelId=${gradeLevelId}&yearId=${yearId}&subject=${encodeURIComponent(subject)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to fetch national exam questions');
    }
    
    const data = await response.json();
    
    
    if (!data || !data.subjects || !Array.isArray(data.subjects)) {
      throw new Error('No subjects found for this exam');
    }

    
    const matchingSubject = data.subjects.find((subj: any) => 
      subj.name.toLowerCase() === subject.toLowerCase()
    );

    if (!matchingSubject || !matchingSubject.questions || !Array.isArray(matchingSubject.questions)) {
      throw new Error('No questions found for this subject');
    }

    
    const transformedQuestions = matchingSubject.questions.map((q: any, index: number) => ({
      id: q.id || index.toString(),
      question: q.question,
      options: q.options.map((opt: any, optIndex: number) => ({
        id: optIndex.toString(),
        text: opt,
        isCorrect: optIndex === getCorrectAnswerIndex(q.correctAnswer)
      })),
      explanation: q.explanation || '',
      image_url: q.image_url || undefined,
      subjectId: matchingSubject.name,
      yearId: data.year,
      gradeLevelId: data.grade
    }));

    return transformedQuestions;
  } catch (error) {
    throw error;
  }
};

export const getNationalExamAvailable = async (gradeNumber: number): Promise<NationalExamAvailableResponse> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    
    const validGrade = Number(gradeNumber);
    if (![6, 8, 12].includes(validGrade)) {
      throw new Error('Invalid grade level. Must be 6, 8, or 12');
    }

    const response = await fetch(`${BASE_URL}/national-exams/${validGrade}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP ${response.status}: Failed to fetch available national exam data`);
    }

    const data = await response.json();
    
    
    
    const allSubjects = new Set<string>();
    const years: number[] = [];
    
    if (data.data && data.data.years && Array.isArray(data.data.years)) {
      data.data.years.forEach((yearData: any) => {
        if (yearData.year) {
          years.push(yearData.year);
        }
        if (yearData.subjects && Array.isArray(yearData.subjects)) {
          yearData.subjects.forEach((subject: string) => {
            allSubjects.add(subject);
          });
        }
      });
    }
    
    const subjects = Array.from(allSubjects);
    
    return {
      success: true,
      data: {
        subjects,
        years
      }
    };
  } catch (error) {
    throw error;
  }
};

export const getRegularPracticeQuestions = async (
  gradeLevelId: number,
  subjectId: string,
  chapterId: string
): Promise<NationalExamAPIResponse[]> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  const url = `${BASE_URL}/questions/grouped?gradeLevelId=${gradeLevelId}&subjectId=${encodeURIComponent(subjectId)}&chapterId=${encodeURIComponent(chapterId)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to fetch practice questions');
  }

  const data = await response.json();

  if (!data.subjects || typeof data.subjects !== 'object') {
    throw new Error('No questions found for this exam');
  }

  const subjectKey = Object.keys(data.subjects)[0];
  if (!subjectKey) {
    throw new Error('No questions found for this exam');
  }

  const subjectData = data.subjects[subjectKey];

  if (!subjectData.questions || !Array.isArray(subjectData.questions)) {
    throw new Error('Invalid questions format in response');
  }

  return subjectData.questions.map((q: any) => {
    const options = q.options.map((opt: string, optIndex: number) => ({
      id: String.fromCharCode(65 + optIndex),
      text: opt,
      isCorrect: q.correctAnswer === String.fromCharCode(65 + optIndex),
    }));

    return {
      id: q.id,
      question: q.question,
      options,
      explanation: q.explanation || q.explanations || '',
      image_url: q.image_url || undefined,
      subjectId: subjectKey,
      gradeLevelId,
      chapterId,
    };
  });
}; 