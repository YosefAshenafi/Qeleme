// Use environment-specific configuration
const getBaseUrl = () => {
  if (__DEV__) {
    return 'https://www.trustechit.com';
  }
  return 'https://www.trustechit.com'; 
};

export const BASE_URL = getBaseUrl();
export const SANTIM_PAY_BASE_URL = __DEV__ ? 'http://localhost:3000' : 'https://pay.qelem.com';
export const SANTIM_PAY_GATEWAY_URL = __DEV__ ? 'http://localhost:16000/api/v1/gateway' : 'https://pay.qelem.com/api/v1/gateway';
export const OTP_BASE_URL = __DEV__ ? 'http://localhost:4000' : 'https://otp.qelem.com';