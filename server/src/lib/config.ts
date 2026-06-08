function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.replace(/\/$/, '');
}

export const gatewayPublicUrl = requireEnv('GATEWAY_PUBLIC_URL', 'http://localhost:3000');
export const upstreamApiUrl = requireEnv('UPSTREAM_API_URL', 'https://www.trustechit.com');
export const paymentUpstreamUrl = requireEnv('PAYMENT_UPSTREAM_URL', 'https://api.megatest.app');
export const otpUpstreamUrl = requireEnv('OTP_UPSTREAM_URL', 'https://api.afromessage.com/api');
export const otpApiKey = process.env.OTP_API_KEY ?? '';
export const otpIdentifierId = process.env.OTP_IDENTIFIER_ID ?? '';
export const otpSenderName = process.env.OTP_SENDER_NAME ?? 'MegaTest';
export const otpDevBypass = process.env.OTP_DEV_BYPASS === 'true' || process.env.NODE_ENV === 'development';
