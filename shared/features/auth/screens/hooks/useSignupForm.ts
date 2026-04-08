import { useState, useCallback, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Grade } from '@/constants/Grades';
import { sendOTP } from '@/utils/otpService';
import { BASE_URL } from '@/config/constants';

export interface ChildData {
  fullName: string;
  username: string;
  grade: Grade | '';
  password: string;
  confirmPassword: string;
  plan?: string;
  usernameValid?: boolean | null;
  usernameChecking?: boolean;
  region?: string;
}

export interface SignupFormState {
  fullName: string;
  username: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  grade: Grade | '';
  region: string;
  acceptTerms: boolean;
  childrenData: ChildData[];
  selectedChildIndex: number | null;
  showGradeModal: boolean;
  showRegionModal: boolean;
  showTermsModal: boolean;
  usernameValid: boolean | null;
  usernameChecking: boolean;
  usernameError: string;
  error: string;
  isSubmitting: boolean;
}

export function useSignupForm() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  
  const numberOfChildren = Number(params.numberOfChildren ?? 1);
  const role: 'student' | 'parent' = params.role === 'parent' ? 'parent' : 'student';
  const initialChildrenData = params.childrenData ? JSON.parse(params.childrenData as string) : 
    Array(numberOfChildren).fill({ fullName: '', username: '', grade: '' as Grade, password: '', confirmPassword: '', region: '' });

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [grade, setGrade] = useState<Grade | ''>('KG');
  const [region, setRegion] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [childrenData, setChildrenData] = useState<ChildData[]>(initialChildrenData);
  const [selectedChildIndex, setSelectedChildIndex] = useState<number | null>(null);
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.prefillData) {
      try {
        const prefillData = JSON.parse(decodeURIComponent(params.prefillData as string));
        setFullName(prefillData.fullName || '');
        setUsername(prefillData.username || '');
        setPassword(prefillData.password || '');
        setConfirmPassword(prefillData.password || '');
        setGrade(prefillData.grade || '');
        setRegion(prefillData.region || '');
        const phone = prefillData.phoneNumber || '';
        const cleanPhone = phone.replace(/^\+251/, '');
        setPhoneNumber(cleanPhone);
        if (prefillData.childrenData && Array.isArray(prefillData.childrenData)) {
          setChildrenData(prefillData.childrenData);
        }
      } catch (error) {
        console.error('Error parsing prefill data:', error);
      }
    }
  }, [params.prefillData]);

  const handleGradeSelect = useCallback((value: string, childIndex?: number) => {
    if (childIndex !== undefined) {
      setChildrenData(prev => prev.map((child, i) => 
        i === childIndex ? { ...child, grade: value as Grade } : child
      ));
    } else {
      setGrade(value as Grade);
    }
    setShowGradeModal(false);
  }, []);

  const handleRegionSelect = useCallback((value: string, childIndex?: number) => {
    if (childIndex !== undefined) {
      setChildrenData(prev => prev.map((child, i) => 
        i === childIndex ? { ...child, region: value } : child
      ));
    } else {
      setRegion(value);
    }
    setShowRegionModal(false);
  }, []);

  const openGradeModal = useCallback((childIndex?: number) => {
    setSelectedChildIndex(childIndex ?? null);
    setShowGradeModal(true);
  }, []);

  const openRegionModal = useCallback((childIndex?: number) => {
    setSelectedChildIndex(childIndex ?? null);
    setShowRegionModal(true);
  }, []);

  const handleChildNameChange = useCallback((text: string, index: number) => {
    setChildrenData(prev => prev.map((child, i) => 
      i === index ? { ...child, fullName: text } : child
    ));
  }, []);

  const checkUsernameAvailability = useCallback(async (usernameToCheck: string) => {
    if (usernameToCheck.length < 5) {
      setUsernameValid(null);
      setUsernameError('');
      return;
    }

    setUsernameChecking(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/check-username?username=${encodeURIComponent(usernameToCheck)}`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
      const data = await response.json();
      setUsernameValid(!data.exists);
      setUsernameError(data.exists ? 'Username is already taken' : '');
    } catch {
      setUsernameError('Error checking username availability');
    } finally {
      setUsernameChecking(false);
    }
  }, []);

  const handleUsernameChange = useCallback((text: string) => {
    setUsername(text);
    if (text.length >= 5) {
      checkUsernameAvailability(text);
    } else {
      setUsernameValid(null);
      setUsernameError(text.length > 0 ? t('signup.errors.usernameMinLength') : '');
    }
  }, [checkUsernameAvailability, t]);

  const handleChildUsernameChange = useCallback((text: string, index: number) => {
    if (text.length >= 5) {
      setChildrenData(prev => prev.map((child, i) => 
        i === index ? { ...child, username: text, usernameValid: null, usernameChecking: false } : child
      ));
      checkChildUsernameAvailability(text, index);
    } else {
      setChildrenData(prev => prev.map((child, i) => 
        i === index ? { ...child, username: text, usernameValid: null, usernameChecking: false } : child
      ));
    }
  }, []);

  const checkChildUsernameAvailability = useCallback(async (usernameToCheck: string, index: number) => {
    setChildrenData(prev => prev.map((child, i) => 
      i === index ? { ...child, username: usernameToCheck, usernameChecking: true } : child
    ));

    try {
      const response = await fetch(`${BASE_URL}/api/auth/check-username?username=${encodeURIComponent(usernameToCheck)}`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
      const data = await response.json();
      setChildrenData(prev => prev.map((child, i) => 
        i === index ? { ...child, username: usernameToCheck, usernameValid: !data.exists, usernameChecking: false } : child
      ));
    } catch {
      setChildrenData(prev => prev.map((child, i) => 
        i === index ? { ...child, username: usernameToCheck, usernameChecking: false } : child
      ));
    }
  }, []);

  const handleChildPasswordChange = useCallback((text: string, index: number) => {
    setChildrenData(prev => prev.map((child, i) => 
      i === index ? { ...child, password: text } : child
    ));
  }, []);

  const handleChildConfirmPasswordChange = useCallback((text: string, index: number) => {
    setChildrenData(prev => prev.map((child, i) => 
      i === index ? { ...child, confirmPassword: text } : child
    ));
  }, []);

  const handleChildRegionChange = useCallback((text: string, index: number) => {
    setChildrenData(prev => prev.map((child, i) => 
      i === index ? { ...child, region: text } : child
    ));
  }, []);

  const handlePhoneChange = useCallback((text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '').slice(0, 9);
    setPhoneNumber(numericValue);
  }, []);

  const handleSignup = useCallback(async () => {
    setError('');

    const fullPhoneNumber = `+251${phoneNumber}`;
    const finalRegion = role === 'student' ? (region || 'Addis Ababa') : '';
    const finalChildrenData = role === 'parent'
      ? childrenData.map(child => ({ ...child, region: child.region || 'Addis Ababa' }))
      : childrenData;

    try {
      await sendOTP(fullPhoneNumber);
    } catch (err) {
      console.error('OTP send error:', err);
    }

    setIsSubmitting(true);
    try {
      await router.replace({
        pathname: '/(auth)/otp',
        params: {
          phoneNumber: fullPhoneNumber,
          fullName: role === 'parent' ? '' : fullName,
          username: role === 'parent' ? '' : username,
          password: role === 'parent' ? '' : password,
          grade,
          region: finalRegion,
          role,
          numberOfChildren: numberOfChildren.toString(),
          childrenData: JSON.stringify(finalChildrenData)
        }
      });
    } catch {
      setError(t('signup.errors.navigationFailed'));
      setIsSubmitting(false);
    }
  }, [phoneNumber, region, role, childrenData, fullName, username, password, grade, numberOfChildren, t]);

  return {
    formState: {
      fullName, setFullName,
      username, setUsername,
      phoneNumber,
      password, setPassword,
      confirmPassword, setConfirmPassword,
      grade, setGrade,
      region, setRegion,
      acceptTerms, setAcceptTerms,
      childrenData, setChildrenData,
      selectedChildIndex,
      showGradeModal, setShowGradeModal,
      showRegionModal, setShowRegionModal,
      showTermsModal, setShowTermsModal,
      usernameValid, usernameChecking, usernameError,
      error, setError,
      isSubmitting,
    },
    role,
    numberOfChildren,
    handlers: {
      handleGradeSelect,
      handleRegionSelect,
      openGradeModal,
      openRegionModal,
      handleChildNameChange,
      handleUsernameChange,
      handleChildUsernameChange,
      handleChildPasswordChange,
      handleChildConfirmPasswordChange,
      handleChildRegionChange,
      handlePhoneChange,
      handleSignup,
      checkUsernameAvailability,
    },
    setters: {
      setSelectedChildIndex,
      setError,
      setIsSubmitting,
    }
  };
}
