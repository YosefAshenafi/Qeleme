import { upstreamApiUrl } from '@/lib/config';
import { proxyRequest } from '@/lib/proxy';

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const url = new URL(request.url);
  const segments = path.map(encodeURIComponent).join('/');
  const target = `${upstreamApiUrl}/${segments}${url.search}`;
  return proxyRequest(target, request);
}
