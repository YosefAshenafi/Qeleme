import { useState, useCallback, useEffect } from 'react';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getKGQuestions, getKGSubcategoryQuestions, getKGCategories, KGQuestion, KGCategory } from '@/features/common/services/earlyService';
import { resolveKgQuestionImageUrl } from '../utils/resolveKgQuestionImageUrl';

export interface Option {
  id: string;
  text: string;
  text_en: string;
  text_am: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  image: string;
  image_url?: string;
  options: Option[];
  explanation: string;
}

export function useQuizData(categoryId: string, subcategoryId?: string, isSubcategory?: boolean) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<KGCategory[]>([]);
  const [nextCategory, setNextCategory] = useState<KGCategory | null>(null);
  const [imageStates, setImageStates] = useState<{ [key: number]: { loading: boolean; error: boolean; loaded: boolean } }>({});

  const getCacheKey = useCallback((cId: string, subId?: string): string => {
    if (subId) return `kg_questions_${cId}_${subId}`;
    return `kg_questions_${cId}`;
  }, []);

  const getCachedQuestions = useCallback(async (cId: string, subId?: string): Promise<KGQuestion[] | null> => {
    try {
      const cacheKey = getCacheKey(cId, subId);
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const cacheAge = Date.now() - parsed.timestamp;
        const maxAge = 24 * 60 * 60 * 1000;
        if (cacheAge < maxAge) {
          return parsed.questions;
        } else {
          await AsyncStorage.removeItem(cacheKey);
        }
      }
      return null;
    } catch {
      return null;
    }
  }, [getCacheKey]);

  const cacheQuestions = useCallback(async (cId: string, qs: KGQuestion[], subId?: string) => {
    try {
      const cacheKey = getCacheKey(cId, subId);
      const cacheData = { questions: qs, timestamp: Date.now() };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch {
    }
  }, [getCacheKey]);

  const transformQuestions = useCallback((apiQuestions: KGQuestion[]): Question[] => {
    return apiQuestions.map((apiQuestion) => ({
      id: apiQuestion.id,
      image: resolveKgQuestionImageUrl(apiQuestion.image_url),
      options: apiQuestion.choices.map((choice, choiceIndex) => ({
        id: String.fromCharCode(65 + choiceIndex),
        text: choice.text_en,
        text_en: choice.text_en.split('\n')[0].trim(),
        text_am: choice.text_am,
        isCorrect: choice.is_correct
      })),
      explanation: `This is a ${apiQuestion.image_alt}.`
    }));
  }, []);

  const preloadSingleImage = useCallback(async (question: Question) => {
    if (question.image) {
      try {
        await Image.prefetch(question.image);
        setImageStates(prev => ({
          ...prev,
          [question.id]: { loading: false, error: false, loaded: true }
        }));
      } catch {
        setImageStates(prev => ({
          ...prev,
          [question.id]: { loading: false, error: true, loaded: false }
        }));
      }
    }
  }, []);

  const preloadImages = useCallback(async (questionsToPreload: Question[]) => {
    questionsToPreload.forEach(async (question) => {
      if (question.image) {
        try {
          await Image.prefetch(question.image);
          setImageStates(prev => {
            const existing = prev[question.id];
            if (existing && existing.loaded) return prev;
            return { ...prev, [question.id]: { loading: false, error: false, loaded: true } };
          });
        } catch {
          setImageStates(prev => {
            const existing = prev[question.id];
            if (existing && existing.loaded) return prev;
            return { ...prev, [question.id]: { loading: false, error: true, loaded: false } };
          });
        }
      }
    });
  }, []);

  const fetchQuestions = useCallback(async () => {
    try {
      setError(null);
      if (!categoryId) throw new Error('Category ID is required');

      const cachedQuestions = await getCachedQuestions(categoryId, isSubcategory ? subcategoryId : undefined);

      if (cachedQuestions && cachedQuestions.length > 0) {
        const transformedQuestions = transformQuestions(cachedQuestions);
        setQuestions(transformedQuestions);
        setLoading(false);
        if (transformedQuestions.length > 0) {
          await preloadSingleImage(transformedQuestions[0]);
          if (transformedQuestions.length > 1) {
            preloadImages(transformedQuestions.slice(1, Math.min(4, transformedQuestions.length)));
          }
        }
        return;
      }

      setLoading(true);
      let apiQuestions: KGQuestion[];

      if (isSubcategory && subcategoryId) {
        const { questions: qs } = await getKGSubcategoryQuestions(parseInt(subcategoryId), parseInt(categoryId));
        apiQuestions = qs;
      } else {
        const { questions: qs } = await getKGQuestions(parseInt(categoryId));
        apiQuestions = qs;
      }

      await cacheQuestions(categoryId, apiQuestions, isSubcategory ? subcategoryId : undefined);

      const transformedQuestions = transformQuestions(apiQuestions);
      setQuestions(transformedQuestions);
      setLoading(false);

      if (transformedQuestions.length > 0) {
        await preloadSingleImage(transformedQuestions[0]);
        if (transformedQuestions.length > 1) {
          preloadImages(transformedQuestions.slice(1, Math.min(4, transformedQuestions.length)));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
      setLoading(false);
    }
  }, [categoryId, subcategoryId, isSubcategory, getCachedQuestions, transformQuestions, preloadSingleImage, preloadImages, cacheQuestions]);

  const fetchAllCategories = useCallback(async () => {
    try {
      const categories = await getKGCategories();
      setAllCategories(categories);
      const currentIndex = categories.findIndex(cat => cat.id === parseInt(categoryId));
      if (currentIndex !== -1 && currentIndex < categories.length - 1) {
        setNextCategory(categories[currentIndex + 1]);
      }
    } catch {
    }
  }, [categoryId]);

  useEffect(() => {
    fetchQuestions();
    fetchAllCategories();
  }, [fetchQuestions, fetchAllCategories]);

  return {
    questions,
    setQuestions,
    loading,
    setLoading,
    error,
    setError,
    allCategories,
    setAllCategories,
    nextCategory,
    setNextCategory,
    imageStates,
    setImageStates,
    fetchQuestions,
    preloadImages,
    preloadSingleImage,
  };
}
