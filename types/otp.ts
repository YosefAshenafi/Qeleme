// types/otp.ts
export interface OTPResponse {
    success: boolean;
    otp?: string;
    message: string;
  }
  
  export interface SendSMSResponse {
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
  }