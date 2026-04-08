
import { PaymentResponse, PaymentStatusResponse } from '@/features/common/types/chappa';
import { CHAPPA_BASE_URL } from '@/config/constants';

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

    
    const callbackUrl = `https://www.trustechit.com/payment-success.html?orderId=${orderId}`;
    const returnUrl = 'megatest://payment-success';

    const response = await fetch(`${CHAPPA_BASE_URL}/pay`, {
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
        callback_url: callbackUrl,
        return_url: returnUrl
      }),
    });

    const data: PaymentResponse = await response.json();

    const transformedResponse: PaymentResponse = {
      success: data.success,
      data: data.data,
      paymentUrl: data.data?.checkout_url,
      error: data.error
    };
    
    return transformedResponse;
  } catch (error) {
    throw error;
  }
};

export const checkPaymentStatus = async (
  orderId: string
): Promise<PaymentStatusResponse> => {
  try {
    const response = await fetch(`${CHAPPA_BASE_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: orderId
      }),
    });

    const data: PaymentStatusResponse = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}; 
