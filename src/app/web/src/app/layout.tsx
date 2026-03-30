import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", weight: ["300", "400", "500", "600", "700"] });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", weight: ["300", "400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Megatest - Academic Vanguard",
  description: "The Vanguard of Higher Education. Where tradition meets the future of cognition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${manrope.variable} light`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-surface font-body selection:bg-primary/20">
        {children}
      </body>
    </html>
  );
}
