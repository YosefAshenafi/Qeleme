// src/types/chappa.ts
export interface PaymentResponse {
  success: boolean;
  data?: {
    checkout_url: string;
    status: string;
  };
  paymentUrl?: string; // For backward compatibility
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