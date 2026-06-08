const STRIPPED_REQUEST_HEADERS = new Set(['host', 'connection', 'content-length', 'transfer-encoding']);

export async function proxyRequest(targetUrl: string, request: Request): Promise<Response> {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (!STRIPPED_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(targetUrl, init);
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('content-encoding');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export function buildUpstreamApiUrl(pathSegments: string[], search: string): string {
  const path = pathSegments.map(encodeURIComponent).join('/');
  const base = `${path}`;
  return search ? `${base}?${search}` : base;
}
