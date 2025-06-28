// utils/otpService.ts
import { OTPResponse, SendSMSResponse } from '../types/otp';

const OTP_BASE_URL = 'https://api.afromessage.com/api';
const OTP_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJpZGVudGlmaWVyIjoiUGJqTk9oSmJkVlR4SnlCUWt2R2RHdVozZHV2ZDRDWmUiLCJleHAiOjE4OTcwNzQ2NzUsImlhdCI6MTczOTMwODI3NSwianRpIjoiNjcyYzViYjUtNTVmMC00NDM0LWEyOGUtM2RiMGI4ZTIyOWUzIn0.PLOFqilQnoDF-idjF6jmkGCA7CC5XXViq6u28pD5weg';

const SENDER_NAME = 'Qelem';
const IDENTIFIER_ID = 'e80ad9d8-adf3-463f-80f4-7c4b39f7f164';

const sendOTP = async (phoneNumber: string): Promise<OTPResponse> => {
  try {
    console.log('OTP Service - Input phone number:', phoneNumber);
    
    // Format phone number with country code if not already present
    // Remove leading 0 if present and add +251
    const cleanNumber = phoneNumber.replace(/^0+/, ''); // Remove leading zeros
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+251${cleanNumber}`;
    
    console.log('OTP Service - Cleaned number:', cleanNumber);
    console.log('OTP Service - Formatted phone:', formattedPhone);
    
    // Build query parameters for the GET request
    const params = new URLSearchParams({
      from: IDENTIFIER_ID,
      sender: SENDER_NAME,
      to: formattedPhone,
      pr: 'Your Qelem verification code is:',
      ps: 'Valid for 5 minutes.',
      sb: '0', // spaces before
      sa: '0', // spaces after
      ttl: '300', // 5 minutes expiration
      len: '6', // 6-digit code
      t: '1', // numeric code type (1 for numeric)
    });

    console.log('OTP Service - API URL:', `${OTP_BASE_URL}/challenge?${params.toString()}`);

    const response = await fetch(`${OTP_BASE_URL}/challenge?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OTP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('OTP Service - Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('OTP Service - Response data:', data);
    
    // Handle Afromessage response format
    if (data.acknowledge === 'success') {
      return {
        success: true,
        message: 'OTP sent successfully'
      };
    } else if (data.acknowledge === 'error') {
      const errorMessage = data.response?.errors?.[0] || data.response?.error || 'Failed to send OTP';
      throw new Error(errorMessage);
    } else {
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
    const response = await fetch(`${OTP_BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OTP_API_KEY}`,
      },
      body: JSON.stringify({
        phoneNumber,
        otp,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SendSMSResponse = await response.json();
    
    if (data.success) {
      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } else {
      throw new Error(data.message || data.error || 'Invalid OTP');
    }
  } catch (error) {
    console.error('OTP Verification Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify OTP'
    };
  }
};

export { sendOTP, verifyOTP };