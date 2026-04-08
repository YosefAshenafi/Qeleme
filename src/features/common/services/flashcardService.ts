import { getAuthToken } from '@/features/auth/utils/authStorage';
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
  flashcards?: Flashcard[];
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  chapters: Chapter[];
}

export interface Grade {
  id: string;
  name: string;
  subjects: Subject[];
}

export const getFlashcardStructure = async (gradeLevelId: string = '1'): Promise<Grade[]> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await fetch(`${BASE_URL}/flashcards?gradeLevelId=${gradeLevelId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
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
    
    
    if (Array.isArray(data)) {
      return data;
    } else if (data.grade) {
      
      return [{
        id: data.grade.id || data.grade,
        name: data.grade.name || data.grade,
        subjects: data.subjects || []
      }];
    } else {
      
      return [data];
    }
  } catch (error) {
    throw error;
  }
};

export const getFlashcardsForChapter = async (
  gradeLevelId: string,
  subjectSlug: string,
  chapterId: string
): Promise<Flashcard[]> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await fetch(
      `${BASE_URL}/flashcards?gradeLevelId=${gradeLevelId}&subjectId=${subjectSlug}&chapterId=${chapterId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No flashcards found for this chapter.');
      }
      
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 
        `Failed to fetch flashcards. Status: ${response.status}`
      );
    }

    const data = await response.json();
    
    
    if (data.subjects && data.subjects.length > 0) {
      const subject = data.subjects[0];
      
      if (subject.chapters && subject.chapters.length > 0) {
        const chapter = subject.chapters[0];
        
        if (chapter.flashcards && chapter.flashcards.length > 0) {
          return chapter.flashcards;
        } else {
        }
      }
    }
    
    return [];
  } catch (error) {
    throw error;
  }
};

export const getFlashcards = async (gradeLevelId: string = '1'): Promise<Grade[]> => {
  return getFlashcardStructure(gradeLevelId);
}; 