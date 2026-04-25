import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Art Gallery | Share Your Masterpieces',
  description: 'Platform for artists to showcase and share their artworks. Upload, like, comment, and follow your favorite creators.',
  openGraph: {
    title: 'Art Gallery',
    description: 'Discover amazing artwork from artists around the world.',
    url: 'https://my-art-gallery-kohl.vercel.app', // замените на свой домен
    siteName: 'Art Gallery',
    images: [
      {
        url: '/og-image.png', // создайте файл в папке public (опционально)
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Art Gallery',
    description: 'Share your art with the world.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}