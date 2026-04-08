import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Grade } from '@/constants/Grades';
import { ChildData } from './useSignupForm';

export interface ValidationErrors {
  [key: string]: string;
}

export function useSignupValidation(
  role: 'student' | 'parent',
  usernameValid: boolean | null,
  childrenData: ChildData[],
  acceptTerms: boolean
) {
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

  const validateChildData = useCallback((child: ChildData, index: number): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    const fullNameError = validateFullName(child.fullName);
    if (fullNameError) errors[`child${index}_fullName`] = fullNameError;

    const usernameError = validateUsername(child.username);
    if (usernameError) errors[`child${index}_username`] = usernameError;

    const gradeError = validateGrade(child.grade);
    if (gradeError) errors[`child${index}_grade`] = gradeError;

    const passwordError = validatePassword(child.password);
    if (passwordError) errors[`child${index}_password`] = passwordError;

    const confirmPasswordError = validatePasswordConfirmation(child.password, child.confirmPassword);
    if (confirmPasswordError) errors[`child${index}_confirmPassword`] = confirmPasswordError;

    return errors;
  }, [validateFullName, validateUsername, validateGrade, validatePassword, validatePasswordConfirmation]);

  const validateAllFields = useCallback((
    fullName: string,
    phoneNumber: string,
    username: string,
    password: string,
    confirmPassword: string,
    grade: Grade | ''
  ): { isValid: boolean; errors: ValidationErrors } => {
    const errors: ValidationErrors = {};

    if (role === 'student') {
      const fullNameError = validateFullName(fullName);
      if (fullNameError) errors.fullName = fullNameError;
    }

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) errors.phoneNumber = phoneError;

    if (role === 'student') {
      const usernameError = validateUsername(username);
      if (usernameError) errors.username = usernameError;

      const passwordError = validatePassword(password);
      if (passwordError) errors.password = passwordError;

      const confirmPasswordError = validatePasswordConfirmation(password, confirmPassword);
      if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

      const gradeError = validateGrade(grade);
      if (gradeError) errors.grade = gradeError;
    }

    if (role === 'parent') {
      childrenData.forEach((child, index) => {
        const childErrors = validateChildData(child, index);
        Object.assign(errors, childErrors);
      });
    }

    if (!acceptTerms) {
      errors.acceptTerms = t('signup.errors.acceptTerms');
    }

    if (role === 'student' && usernameValid === false) {
      errors.username = t('signup.errors.usernameTaken');
    }

    childrenData.forEach((child, index) => {
      if (child.usernameValid === false) {
        errors[`child${index}_username`] = t('signup.errors.usernameTaken');
      }
    });

    return { isValid: Object.keys(errors).length === 0, errors };
  }, [
    role, validateFullName, validatePhoneNumber, validateUsername, 
    validatePassword, validatePasswordConfirmation, validateGrade, 
    validateChildData, acceptTerms, usernameValid, childrenData, t
  ]);

  return {
    validateFullName,
    validatePhoneNumber,
    validatePassword,
    validatePasswordConfirmation,
    validateUsername,
    validateGrade,
    validateChildData,
    validateAllFields,
  };
}
