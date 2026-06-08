import { otpDevBypass } from '@/lib/config';
import { verifyOtp } from '@/lib/otp-store';
import { formatEthiopianPhone } from '@/lib/phone';

type VerifyOtpBody = {
  phoneNumber?: string;
  otp?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyOtpBody;

    if (!body.phoneNumber || !body.otp) {
      return Response.json(
        { success: false, message: 'phoneNumber and otp are required' },
        { status: 400 },
      );
    }

    const formattedPhone = formatEthiopianPhone(body.phoneNumber);

    if (otpDevBypass && formattedPhone === '+251900000000' && body.otp === '123456') {
      return Response.json({ success: true, message: 'OTP verified successfully' });
    }

    const valid = verifyOtp(formattedPhone, body.otp);

    if (!valid) {
      return Response.json({ success: false, message: 'Invalid or expired OTP' }, { status: 400 });
    }

    return Response.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to verify OTP',
      },
      { status: 500 },
    );
  }
}
