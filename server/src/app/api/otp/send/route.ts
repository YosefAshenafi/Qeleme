import {
  otpApiKey,
  otpDevBypass,
  otpIdentifierId,
  otpSenderName,
  otpUpstreamUrl,
} from '@/lib/config';
import { generateOtpCode, saveOtp } from '@/lib/otp-store';
import { formatEthiopianPhone } from '@/lib/phone';

type SendOtpBody = {
  phoneNumber?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SendOtpBody;
    if (!body.phoneNumber) {
      return Response.json({ success: false, message: 'phoneNumber is required' }, { status: 400 });
    }

    const formattedPhone = formatEthiopianPhone(body.phoneNumber);

    if (otpDevBypass && formattedPhone === '+251900000000') {
      const testOtp = '123456';
      saveOtp(formattedPhone, testOtp);
      return Response.json({
        success: true,
        message: 'OTP bypass enabled for development',
      });
    }

    if (!otpApiKey || !otpIdentifierId) {
      return Response.json(
        { success: false, message: 'OTP provider is not configured on the gateway' },
        { status: 503 },
      );
    }

    const otp = generateOtpCode();
    const message = `Your MegaTest verification code is: ${otp}. Valid for 5 minutes.`;

    const params = new URLSearchParams({
      from: otpIdentifierId,
      sender: otpSenderName,
      to: formattedPhone,
      message,
      callback: '',
    });

    const upstream = await fetch(`${otpUpstreamUrl}/send?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${otpApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      return Response.json(
        { success: false, message: `OTP provider error: ${errorText}` },
        { status: upstream.status },
      );
    }

    const data = await upstream.json() as {
      acknowledge?: string;
      response?: { errors?: string[]; error?: string };
      message?: string;
      error?: string;
    };

    if (data.acknowledge === 'success') {
      saveOtp(formattedPhone, otp);
      return Response.json({ success: true, message: 'OTP sent successfully' });
    }

    const errorMessage =
      data.response?.errors?.[0] ??
      data.response?.error ??
      data.message ??
      data.error ??
      'Failed to send OTP';

    return Response.json({ success: false, message: errorMessage }, { status: 502 });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send OTP',
      },
      { status: 500 },
    );
  }
}
