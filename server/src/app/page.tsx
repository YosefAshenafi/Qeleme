import { gatewayPublicUrl, upstreamApiUrl, paymentUpstreamUrl } from '@/lib/config';

export default function HomePage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 640 }}>
      <h1>MegaTest API Gateway</h1>
      <p>The mobile app talks only to this server. Upstream URLs and secrets stay here.</p>
      <ul>
        <li>
          <strong>Public URL:</strong> {gatewayPublicUrl}
        </li>
        <li>
          <strong>REST API proxy:</strong> /api/*
        </li>
        <li>
          <strong>Payments:</strong> /api/payments/pay, /api/payments/verify
        </li>
        <li>
          <strong>OTP:</strong> /api/otp/send, /api/otp/verify
        </li>
        <li>
          <strong>Static assets:</strong> /upstream/*
        </li>
      </ul>
      <p style={{ color: '#666', fontSize: 14 }}>
        Upstream API: {upstreamApiUrl} · Payment: {paymentUpstreamUrl}
      </p>
    </main>
  );
}
