export function formatEthiopianPhone(phoneNumber: string): string {
  const cleanNumber = phoneNumber.replace(/^0+/, '');
  return phoneNumber.startsWith('+') ? phoneNumber : `+251${cleanNumber}`;
}
