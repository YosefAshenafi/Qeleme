import { useState, useCallback, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Grade } from '@/features/common/constants/Grades';
import { BASE_URL } from '@/config/constants';
import { sendOTP } from '@/features/common/utils/otpService';
import { gradeToSignupClassInput, parseSignupClassInputToGrade } from '@/features/auth/utils/signupGradeInput';

export interface SignupFormState {
  fullName: string;
  username: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  grade: Grade | '';
  gradeInput: string;
  region: string;
  acceptTerms: boolean;
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

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [grade, setGrade] = useState<Grade | ''>('');
  const [gradeInput, setGradeInput] = useState('');
  const [region, setRegion] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
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
        const g = prefillData.grade || '';
        setGrade(g ? (g as Grade) : '');
        setGradeInput(g ? gradeToSignupClassInput(g) : '');
        setRegion(prefillData.region || '');
        const phone = prefillData.phoneNumber || '';
        const cleanPhone = phone.replace(/^\+251/, '');
        setPhoneNumber(cleanPhone);
      } catch {
      }
    }
  }, [params.prefillData]);

  const handleGradeNumberChange = useCallback((text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, 2);
    setGradeInput(digits);
    setGrade(parseSignupClassInputToGrade(digits));
  }, []);

  const handleRegionSelect = useCallback((value: string) => {
    setRegion(value);
    setShowRegionModal(false);
  }, []);

  const openRegionModal = useCallback(() => {
    setShowRegionModal(true);
  }, []);

  const checkUsernameAvailability = useCallback(async (usernameToCheck: string) => {
    if (usernameToCheck.length < 5) {
      setUsernameValid(null);
      setUsernameError('');
      return;
    }

    setUsernameChecking(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/check-username?username=${encodeURIComponent(usernameToCheck)}`, {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      const data = await res.json();
      setUsernameValid(!data.exists);
      setUsernameError(data.exists ? 'Username is already taken' : '');
    } catch {
      setUsernameError('Error checking username availability');
    } finally {
      setUsernameChecking(false);
    }
  }, []);

  const handleUsernameChange = useCallback(
    (text: string) => {
      setUsername(text);
      if (text.length >= 5) {
        checkUsernameAvailability(text);
      } else {
        setUsernameValid(null);
        setUsernameError(text.length > 0 ? t('signup.errors.usernameMinLength') : '');
      }
    },
    [checkUsernameAvailability, t],
  );

  const handlePhoneChange = useCallback((text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '').slice(0, 9);
    setPhoneNumber(numericValue);
  }, []);

  const handleSignup = useCallback(async () => {
    setError('');

    const fullPhoneNumber = `+251${phoneNumber}`;
    const finalRegion = region || 'Addis Ababa';

    try {
      await sendOTP(fullPhoneNumber);
    } catch (err) {
    }

    setIsSubmitting(true);
    try {
      await router.replace({
        pathname: '/(auth)/otp',
        params: {
          phoneNumber: fullPhoneNumber,
          fullName,
          username,
          password,
          grade,
          region: finalRegion,
        },
      });
    } catch {
      setError(t('signup.errors.navigationFailed'));
      setIsSubmitting(false);
    }
  }, [phoneNumber, region, fullName, username, password, grade, t]);

  return {
    formState: {
      fullName,
      setFullName,
      username,
      setUsername,
      phoneNumber,
      password,
      setPassword,
      confirmPassword,
      setConfirmPassword,
      grade,
      setGrade,
      gradeInput,
      region,
      setRegion,
      acceptTerms,
      setAcceptTerms,
      showRegionModal,
      setShowRegionModal,
      showTermsModal,
      setShowTermsModal,
      usernameValid,
      usernameChecking,
      usernameError,
      error,
      setError,
      isSubmitting,
    },
    handlers: {
      handleGradeNumberChange,
      handleRegionSelect,
      openRegionModal,
      handleUsernameChange,
      handlePhoneChange,
      handleSignup,
      checkUsernameAvailability,
    },
    setters: {
      setError,
      setIsSubmitting,
    },
  };
}
