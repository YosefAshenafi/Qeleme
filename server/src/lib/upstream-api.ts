import { upstreamApiUrl } from '@/lib/config';
import { proxyRequest } from '@/lib/proxy';

export async function proxyUpstreamApi(request: Request, pathSegments: string[]): Promise<Response> {
  const url = new URL(request.url);
  const path = pathSegments.map(encodeURIComponent).join('/');
  const target = `${upstreamApiUrl}/api/${path}${url.search}`;
  return proxyRequest(target, request);
}
