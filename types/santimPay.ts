// src/types/santimPay.ts
export interface PaymentResponse {
    success: boolean;
    paymentUrl: string;
    error?: string;
  }
  
  export interface PaymentStatusResponse {
    success: boolean;
    data?: {
      status: string;
      orderId: string;
      transactionId: string;
    };
    error?: string;
  }
  
  export interface PaymentButtonProps {
    amount: number;
    onSuccess?: () => void;
    onFailure?: () => void;
    children?: React.ReactNode;
  }