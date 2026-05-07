// app/layout.tsx
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Animations from '@/components/Animations';
import PageLoader from '@/components/PageLoader';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Furline',
  description: 'Furry art community',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playwrite+DE+SAS&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Оборачиваем всё приложение в Suspense */}
        <Suspense>
          {children}
          <Animations />
          <PageLoader />
        </Suspense>
      </body>
    </html>
  );
}