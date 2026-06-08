import Constants from 'expo-constants';
import { GATEWAY_PRODUCTION_URL } from '@/core/config/gateway';

function resolveGatewayUrl(): string {
  const fromExpo = Constants.expoConfig?.extra?.apiUrl;
  if (typeof fromExpo === 'string' && fromExpo.trim().length > 0) {
    return fromExpo.trim().replace(/\/$/, '');
  }
  return GATEWAY_PRODUCTION_URL;
}

export const GATEWAY_BASE_URL = resolveGatewayUrl();

export const BASE_URL = GATEWAY_BASE_URL;

export const ASSET_BASE_URL = `${GATEWAY_BASE_URL}/upstream`;

function resolvePaymentSuccessHost(): string {
  try {
    return new URL(GATEWAY_BASE_URL).host;
  } catch {
    return new URL(GATEWAY_PRODUCTION_URL).host;
  }
}

export const PAYMENT_SUCCESS_CALLBACK_HOST = resolvePaymentSuccessHost();
