// src/services/santimPayService.ts
import { PaymentResponse, PaymentStatusResponse } from '../types/santimPay';
import { SANTIM_PAY_BASE_URL } from '../config/constants';

const BASE_URL = SANTIM_PAY_BASE_URL;

export const initiatePayment = async (
  amount: number,
  orderId: string,
  customerPhone: string
): Promise<PaymentResponse> => {
  try {
    const paymentReason = amount === 499 
      ? "Qelem Premium Subscription - 6 Months"
      : "Qelem Premium Subscription - 12 Months";

    const response = await fetch(`${BASE_URL}/api/payment/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: orderId,
        amount,
        paymentReason,
        successRedirectUrl: "https://santimpay.com",
        failureRedirectUrl: "https://santimpay.com",
        notifyUrl: "https://webhook.site/783a4514-3e30-4315-9c68-c8b41a743c9d",
        phoneNumber: customerPhone,
        cancelRedirectUrl: "https://santimpay.com"
      }),
    });

    const data: PaymentResponse = await response.json();
    return data;
  } catch (error) {
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
    throw error;
  }
};