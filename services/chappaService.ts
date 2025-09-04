// src/services/chappaService.ts
import { PaymentResponse, PaymentStatusResponse } from '../types/chappa';
import { CHAPPA_BASE_URL } from '../config/constants';

export const initiatePayment = async (
  amount: number,
  orderId: string,
  customerPhone: string,
  planDuration?: number,
  customerEmail?: string,
  customerName?: string
): Promise<PaymentResponse> => {
  try {
    // Split customer name into first and last name
    const nameParts = customerName ? customerName.split(' ') : ['Customer', 'User'];
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    // Use a proper success page URL that can handle deep linking back to the app
    const callbackUrl = `https://www.trustechit.com/payment-success.html?orderId=${orderId}`;
    const returnUrl = 'qelem://payment-success';

    console.log('Chappa service - Request URL:', `${CHAPPA_BASE_URL}/pay`);
    console.log('Chappa service - Request body:', {
      amount: amount.toString(),
      email: customerEmail || 'customer@qelem.com',
      first_name: firstName,
      last_name: lastName,
      tx_ref: orderId,
      callback_url: callbackUrl,
      return_url: returnUrl
    });

    const response = await fetch(`${CHAPPA_BASE_URL}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount.toString(),
        email: customerEmail || 'customer@qelem.com',
        first_name: firstName,
        last_name: lastName,
        tx_ref: orderId,
        callback_url: callbackUrl,
        return_url: returnUrl
      }),
    });

    console.log('Chappa service - Response status:', response.status);
    console.log('Chappa service - Response ok:', response.ok);

    const data: PaymentResponse = await response.json();
    console.log('Chappa service - Response data:', data);
    
    // Transform the response to match the expected format
    const transformedResponse: PaymentResponse = {
      success: data.success,
      data: data.data,
      paymentUrl: data.data?.checkout_url, // Map checkout_url to paymentUrl for backward compatibility
      error: data.error
    };
    
    return transformedResponse;
  } catch (error) {
    console.log('Chappa service - Error:', error);
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