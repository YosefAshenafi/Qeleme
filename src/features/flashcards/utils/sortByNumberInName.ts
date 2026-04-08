export function extractNumberFromName(name: string): number {
  const match = name.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
