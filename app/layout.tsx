import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Animations from '@/components/Animations';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <Animations />
        </ThemeProvider>
      </body>
    </html>
  );
}