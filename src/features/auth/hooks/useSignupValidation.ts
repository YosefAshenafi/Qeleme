import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Grade } from '@/features/common/constants/Grades';

export interface ValidationErrors {
  [key: string]: string;
}

export function useSignupValidation(usernameValid: boolean | null, acceptTerms: boolean) {
  const { t } = useTranslation();

  const validateFullName = useCallback((name: string): string => {
    if (!name || name.trim().length === 0) {
      return t('signup.errors.fullNameRequired');
    }
    if (name.trim().length < 2) {
      return t('signup.errors.fullNameMinLength');
    }
    const validNameRegex = /^[a-zA-Z\u1200-\u137F\s\-'\.]+$/;
    if (!validNameRegex.test(name.trim())) {
      return t('signup.errors.fullNameInvalid');
    }
    return '';
  }, [t]);

  const validatePhoneNumber = useCallback((phone: string): string => {
    if (!phone || phone.length === 0) {
      return t('signup.errors.phoneRequired');
    }
    if (phone.length !== 9) {
      return t('signup.errors.phoneInvalid');
    }
    if (!/^[0-9]{9}$/.test(phone)) {
      return t('signup.errors.phoneInvalid');
    }
    const validPrefixes = ['9', '7', '8'];
    if (!validPrefixes.includes(phone[0])) {
      return t('signup.errors.phoneInvalidPrefix');
    }
    return '';
  }, [t]);

  const validatePassword = useCallback((pwd: string): string => {
    if (!pwd || pwd.length === 0) {
      return t('signup.errors.passwordRequired');
    }
    if (pwd.length < 6) {
      return t('signup.errors.passwordMinLength');
    }
    if (pwd.length > 50) {
      return t('signup.errors.passwordMaxLength');
    }
    return '';
  }, [t]);

  const validatePasswordConfirmation = useCallback((pwd: string, confirmPwd: string): string => {
    if (!confirmPwd || confirmPwd.length === 0) {
      return t('signup.errors.confirmPasswordRequired');
    }
    if (pwd !== confirmPwd) {
      return t('signup.errors.passwordMismatch');
    }
    return '';
  }, [t]);

  const validateUsername = useCallback((usr: string): string => {
    if (!usr || usr.length === 0) {
      return t('signup.errors.usernameRequired');
    }
    if (usr.length < 5) {
      return t('signup.errors.usernameMinLength');
    }
    if (usr.length > 20) {
      return t('signup.errors.usernameMaxLength');
    }
    const validUsernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validUsernameRegex.test(usr)) {
      return t('signup.errors.usernameInvalid');
    }
    return '';
  }, [t]);

  const validateGrade = useCallback((grd: Grade | ''): string => {
    if (!grd) {
      return t('signup.errors.gradeRequired');
    }
    return '';
  }, [t]);

  const validateAllFields = useCallback(
    (
      fullName: string,
      phoneNumber: string,
      username: string,
      password: string,
      confirmPassword: string,
      grade: Grade | '',
    ): { isValid: boolean; errors: ValidationErrors } => {
      const errors: ValidationErrors = {};

      const fullNameError = validateFullName(fullName);
      if (fullNameError) errors.fullName = fullNameError;

      const phoneError = validatePhoneNumber(phoneNumber);
      if (phoneError) errors.phoneNumber = phoneError;

      const usernameError = validateUsername(username);
      if (usernameError) errors.username = usernameError;

      const passwordError = validatePassword(password);
      if (passwordError) errors.password = passwordError;

      const confirmPasswordError = validatePasswordConfirmation(password, confirmPassword);
      if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

      const gradeError = validateGrade(grade);
      if (gradeError) errors.grade = gradeError;

      if (!acceptTerms) {
        errors.acceptTerms = t('signup.errors.acceptTerms');
      }

      if (usernameValid === false) {
        errors.username = t('signup.errors.usernameTaken');
      }

      return { isValid: Object.keys(errors).length === 0, errors };
    },
    [validateFullName, validatePhoneNumber, validateUsername, validatePassword, validatePasswordConfirmation, validateGrade, acceptTerms, usernameValid, t],
  );

  return {
    validateFullName,
    validatePhoneNumber,
    validatePassword,
    validatePasswordConfirmation,
    validateUsername,
    validateGrade,
    validateAllFields,
  };
}
