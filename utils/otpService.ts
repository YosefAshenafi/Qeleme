// utils/otpService.ts
import { OTP_BASE_URL } from '@/config/constants';
import { OTPResponse, SendSMSResponse } from '../types/otp';
import { storeOTP, getStoredOTP, clearStoredOTP, isOTPValid } from './authStorage';

const OTP_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJpZGVudGlmaWVyIjoiUGJqTk9oSmJkVlR4SnlCUWt2R2RHdVozZHV2ZDRDWmUiLCJleHAiOjE4OTcwNzQ2NzUsImlhdCI6MTczOTMwODI3NSwianRpIjoiNjcyYzViYjUtNTVmMC00NDM0LWEyOGUtM2RiMGI4ZTIyOWUzIn0.PLOFqilQnoDF-idjF6jmkGCA7CC5XXViq6u28pD5weg';

const SENDER_NAME = 'Qelem';
const IDENTIFIER_ID = 'e80ad9d8-adf3-463f-80f4-7c4b39f7f164';

// Generate a random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (phoneNumber: string): Promise<OTPResponse> => {
  try {
    // Format phone number with country code if not already present
    // Remove leading 0 if present and add +251
    const cleanNumber = phoneNumber.replace(/^0+/, ''); // Remove leading zeros
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+251${cleanNumber}`;
    
    // Generate a 6-digit OTP
    const otp = generateOTP();
    
    // Create the message content
    const message = `Your Qelem verification code is: ${otp}. Valid for 5 minutes.`;
    
    // Build query parameters for the GET request
    const params = new URLSearchParams({
      from: IDENTIFIER_ID,
      sender: SENDER_NAME,
      to: formattedPhone,
      message: message,
      callback: '', // Optional callback URL
    });

    const apiUrl = `${OTP_BASE_URL}/send?${params.toString()}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OTP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    
    // Handle Afromessage response format
    if (data.acknowledge === 'success') {
      // Store the OTP with 5-minute expiration
      await storeOTP(formattedPhone, otp, 5);
      
      return {
        success: true,
        message: 'OTP sent successfully',
        otp: otp // Include OTP in response for development/testing (remove in production)
      };
    } else if (data.acknowledge === 'error') {
      const errorMessage = data.response?.errors?.[0] || data.response?.error || 'Failed to send OTP';
      throw new Error(errorMessage);
    } else {
      throw new Error(data.message || data.error || 'Failed to send OTP');
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send OTP'
    };
  }
};

const verifyOTP = async (phoneNumber: string, otp: string): Promise<OTPResponse> => {
  try {
    // Format phone number consistently
    const cleanNumber = phoneNumber.replace(/^0+/, '');
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+251${cleanNumber}`;
    
    // Verify the OTP
    const isValid = await isOTPValid(formattedPhone, otp);
    
    if (isValid) {
      // Clear the OTP after successful verification
      await clearStoredOTP(formattedPhone);
      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } else {
      throw new Error('Invalid or expired OTP');
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify OTP'
    };
  }
};

export { sendOTP, verifyOTP, generateOTP };