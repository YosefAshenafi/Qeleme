// utils/otpService.ts
import { OTPResponse, SendSMSResponse } from '../types/otp';
import { storeOTP, getStoredOTP, clearStoredOTP, isOTPValid } from './authStorage';

const OTP_BASE_URL = 'https://api.afromessage.com/api';
const OTP_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJpZGVudGlmaWVyIjoiUGJqTk9oSmJkVlR4SnlCUWt2R2RHdVozZHV2ZDRDWmUiLCJleHAiOjE4OTcwNzQ2NzUsImlhdCI6MTczOTMwODI3NSwianRpIjoiNjcyYzViYjUtNTVmMC00NDM0LWEyOGUtM2RiMGI4ZTIyOWUzIn0.PLOFqilQnoDF-idjF6jmkGCA7CC5XXViq6u28pD5weg';

const SENDER_NAME = 'Qelem';
const IDENTIFIER_ID = 'e80ad9d8-adf3-463f-80f4-7c4b39f7f164';

// Generate a random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (phoneNumber: string): Promise<OTPResponse> => {
  try {
    console.log('OTP Service - Input phone number:', phoneNumber);
    
    // Format phone number with country code if not already present
    // Remove leading 0 if present and add +251
    const cleanNumber = phoneNumber.replace(/^0+/, ''); // Remove leading zeros
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+251${cleanNumber}`;
    
    console.log('OTP Service - Cleaned number:', cleanNumber);
    console.log('OTP Service - Formatted phone:', formattedPhone);
    
    // Generate a 6-digit OTP
    const otp = generateOTP();
    console.log('OTP Service - Generated OTP:', otp);
    
    // Create the message content
    const message = `Your Qelem verification code is: ${otp}. Valid for 5 minutes.`;
    console.log('OTP Service - Message content:', message);
    
    // Build query parameters for the GET request
    const params = new URLSearchParams({
      from: IDENTIFIER_ID,
      sender: SENDER_NAME,
      to: formattedPhone,
      message: message,
      callback: '', // Optional callback URL
    });

    const apiUrl = `${OTP_BASE_URL}/send?${params.toString()}`;
    console.log('OTP Service - API URL:', apiUrl);
    console.log('OTP Service - API Key:', OTP_API_KEY.substring(0, 20) + '...');

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OTP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('OTP Service - Response status:', response.status);
    console.log('OTP Service - Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OTP Service - Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('OTP Service - Response data:', data);
    
    // Handle Afromessage response format
    if (data.acknowledge === 'success') {
      // Store the OTP with 5-minute expiration
      await storeOTP(formattedPhone, otp, 5);
      console.log('OTP Service - OTP stored successfully');
      
      return {
        success: true,
        message: 'OTP sent successfully',
        otp: otp // Include OTP in response for development/testing (remove in production)
      };
    } else if (data.acknowledge === 'error') {
      const errorMessage = data.response?.errors?.[0] || data.response?.error || 'Failed to send OTP';
      console.error('OTP Service - API error:', errorMessage);
      throw new Error(errorMessage);
    } else {
      console.error('OTP Service - Unexpected response format:', data);
      throw new Error(data.message || data.error || 'Failed to send OTP');
    }
  } catch (error) {
    console.error('OTP Service Error:', error);
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
    
    console.log('OTP Verification - Phone:', formattedPhone, 'OTP:', otp);
    
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
    console.error('OTP Verification Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify OTP'
    };
  }
};

export { sendOTP, verifyOTP, generateOTP };