import { Roboto, Playwrite_DE_SAS } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Animations from '@/components/Animations';
import PageLoader from '@/components/PageLoader';

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const playwrite = Playwrite_DE_SAS({
  weight: '400',
  display: 'swap',
});

export const metadata = {
  title: 'Furline',
  description: 'Furry art community',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={roboto.className} suppressHydrationWarning>
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