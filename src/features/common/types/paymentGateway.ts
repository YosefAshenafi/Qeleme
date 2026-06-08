
export interface PaymentResponse {
  success: boolean;
  data?: {
    checkout_url: string;
    status: string;
  };
  paymentUrl?: string;
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
