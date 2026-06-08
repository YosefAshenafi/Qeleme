type OtpEntry = {
  otp: string;
  expiresAt: number;
};

const store = new Map<string, OtpEntry>();

const OTP_TTL_MS = 5 * 60 * 1000;

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function saveOtp(phoneNumber: string, otp: string): void {
  store.set(phoneNumber, {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
  });
}

export function verifyOtp(phoneNumber: string, otp: string): boolean {
  const entry = store.get(phoneNumber);
  if (!entry) {
    return false;
  }
  if (Date.now() > entry.expiresAt) {
    store.delete(phoneNumber);
    return false;
  }
  const valid = entry.otp === otp;
  if (valid) {
    store.delete(phoneNumber);
  }
  return valid;
}
