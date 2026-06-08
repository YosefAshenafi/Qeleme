import { gatewayPublicUrl, paymentUpstreamUrl } from '@/lib/config';

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  const txRef = typeof body.tx_ref === 'string' ? body.tx_ref : '';

  const payload = {
    ...body,
    callback_url: txRef
      ? `${gatewayPublicUrl}/payment-success.html?orderId=${encodeURIComponent(txRef)}`
      : body.callback_url,
    return_url: typeof body.return_url === 'string' ? body.return_url : 'megatest://payment-success',
  };

  const upstream = await fetch(`${paymentUpstreamUrl}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}
