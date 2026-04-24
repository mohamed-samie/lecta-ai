// apps/web/src/app/layout.tsx
import { Inter, Instrument_Serif } from 'next/font/google';
import './globals.css';

import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Lecta AI — AI-Powered Exam Preparation',
  description:
    'Upload your lecture and a previous exam, generate a grounded practice exam, solve it in the browser, and review weak areas.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
