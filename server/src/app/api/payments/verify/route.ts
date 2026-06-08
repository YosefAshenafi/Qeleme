import { paymentUpstreamUrl } from '@/lib/config';

export async function POST(request: Request) {
  const body = await request.text();
  const upstream = await fetch(`${paymentUpstreamUrl}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}
