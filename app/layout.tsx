import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import Animations from '@/components/Animations';
import PageLoader from '@/components/PageLoader';

export const metadata: Metadata = {
  title: 'Furbyte – Art Gallery',
  description: 'A community for artists to share and discover artwork.',
  openGraph: {
    title: 'Furbyte',
    description: 'Share your art with the world',
    url: 'https://your-domain.vercel.app',
    siteName: 'Furbyte',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Furbyte',
    description: 'Share your art',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <Animations />
          <PageLoader />
        </ThemeProvider>
      </body>
    </html>
  );
}