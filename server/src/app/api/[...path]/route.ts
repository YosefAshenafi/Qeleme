import { proxyUpstreamApi } from '@/lib/upstream-api';

type RouteContext = { params: Promise<{ path: string[] }> };

const RESERVED_SEGMENTS = new Set(['payments', 'otp', 'health']);

async function handle(request: Request, context: RouteContext) {
  const { path } = await context.params;
  if (path[0] && RESERVED_SEGMENTS.has(path[0])) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  return proxyUpstreamApi(request, path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
