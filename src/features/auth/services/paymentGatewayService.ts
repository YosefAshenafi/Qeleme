
import { PaymentResponse, PaymentStatusResponse } from '@/features/common/types/paymentGateway';
import { GATEWAY_BASE_URL } from '@/config/constants';

export const initiatePayment = async (
  amount: number,
  orderId: string,
  customerPhone: string,
  planDuration?: number,
  customerEmail?: string,
  customerName?: string
): Promise<PaymentResponse> => {
  try {
    const nameParts = customerName ? customerName.split(' ') : ['Customer', 'User'];
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    const response = await fetch(`${GATEWAY_BASE_URL}/api/payments/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount.toString(),
        email: customerEmail || 'customer@megatest.app',
        first_name: firstName,
        last_name: lastName,
        tx_ref: orderId,
        return_url: 'megatest://payment-success',
      }),
    });

    const data: PaymentResponse = await response.json();

    return {
      success: data.success,
      data: data.data,
      paymentUrl: data.data?.checkout_url,
      error: data.error,
    };
  } catch (error) {
    throw error;
  }
};

export const checkPaymentStatus = async (
  orderId: string
): Promise<PaymentStatusResponse> => {
  try {
    const response = await fetch(`${GATEWAY_BASE_URL}/api/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: orderId,
      }),
    });

    const data: PaymentStatusResponse = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};
