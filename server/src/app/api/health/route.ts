export async function GET() {
  return Response.json({
    ok: true,
    service: 'megatest-gateway',
    timestamp: new Date().toISOString(),
  });
}
