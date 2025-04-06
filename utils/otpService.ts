// utils/otpService.ts
import { OTP_BASE_URL } from '@/config/constants';
import { OTPResponse, SendSMSResponse } from '../types/otp';

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (phoneNumber: string): Promise<OTPResponse> => {
  try {
    const otp = generateOTP();
    const message = `Your verification code is: ${otp}`;
    phoneNumber = "0910810689"; // TODO: remove this on the production
    
    const response = await fetch(`${OTP_BASE_URL}/api/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        message,
      }),
    });

    const data: SendSMSResponse = await response.json();
    
    if (data.success) {
      return {
        success: true,
        otp, // Note: In production, handle OTP storage securely
        message: 'OTP sent successfully'
      };
    } else {
      throw new Error(data.message || 'Failed to send OTP');
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send OTP'
    };
  }
};

export { generateOTP, sendOTP };