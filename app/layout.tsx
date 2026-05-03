import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Animations from '@/components/Animations';
import PageLoader from '@/components/PageLoader';

export const metadata = {
  title: 'Furbyte',
  description: 'Furry art community',
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