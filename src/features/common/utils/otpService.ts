
import { GATEWAY_BASE_URL } from '@/config/constants';
import { OTPResponse } from '../types/otp';

const formatPhone = (phoneNumber: string): string => {
  const cleanNumber = phoneNumber.replace(/^0+/, '');
  return phoneNumber.startsWith('+') ? phoneNumber : `+251${cleanNumber}`;
};

const sendOTP = async (phoneNumber: string): Promise<OTPResponse> => {
  try {
    const formattedPhone = formatPhone(phoneNumber);

    const response = await fetch(`${GATEWAY_BASE_URL}/api/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber: formattedPhone }),
    });

    const data = await response.json() as OTPResponse;

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to send OTP',
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send OTP',
    };
  }
};

const verifyOTP = async (phoneNumber: string, otp: string): Promise<OTPResponse> => {
  try {
    const formattedPhone = formatPhone(phoneNumber);

    const response = await fetch(`${GATEWAY_BASE_URL}/api/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber: formattedPhone, otp }),
    });

    const data = await response.json() as OTPResponse;

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to verify OTP',
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify OTP',
    };
  }
};

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export { sendOTP, verifyOTP, generateOTP };
