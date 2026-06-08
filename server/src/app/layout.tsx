import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MegaTest API Gateway',
  description: 'Secure proxy between the MegaTest mobile app and upstream services',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
