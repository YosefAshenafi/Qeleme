// src/services/santimPayService.ts
import { PaymentResponse, PaymentStatusResponse } from '../types/santimPay';

const BASE_URL = 'http://localhost:3001'; // Change this to your actual server URL when deploying

export const initiatePayment = async (
  amount: number,
  orderId: string,
  customerPhone: string
): Promise<PaymentResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/payment/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        orderId,
        customerPhone,
      }),
    });

    const data: PaymentResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Payment initiation failed:', error);
    throw error;
  }
};

export const checkPaymentStatus = async (
  orderId: string
): Promise<PaymentStatusResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/payment/status/${orderId}`);
    const data: PaymentStatusResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Status check failed:', error);
    throw error;
  }
};