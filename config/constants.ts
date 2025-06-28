// Use environment-specific configuration
const getBaseUrl = () => {
  if (__DEV__) {
    console.log('🔧 DEV MODE: Using trustechit.com as base URL');
    return 'https://www.trustechit.com';
  }
  console.log('🚀 PRODUCTION MODE: Using trustechit.com as base URL');
  return 'https://www.trustechit.com'; 
};

export const BASE_URL = getBaseUrl();
export const SANTIM_PAY_BASE_URL = __DEV__ ? 'http://localhost:3000' : 'https://pay.qelem.com';
export const SANTIM_PAY_GATEWAY_URL = __DEV__ ? 'http://localhost:16000/api/v1/gateway' : 'https://pay.qelem.com/api/v1/gateway';
export const OTP_BASE_URL = __DEV__ ? 'http://localhost:4000' : 'https://otp.qelem.com';

// Debug logging for all constants
console.log('📡 API Configuration:');
console.log('  BASE_URL:', BASE_URL);
console.log('  SANTIM_PAY_BASE_URL:', SANTIM_PAY_BASE_URL);
console.log('  SANTIM_PAY_GATEWAY_URL:', SANTIM_PAY_GATEWAY_URL);
console.log('  OTP_BASE_URL:', OTP_BASE_URL);
console.log('  __DEV__:', __DEV__);  