import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ToastContainer from '@/components/ui/ToastContainer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Signal Clone',
  description: 'A secure messaging application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-signal-bg text-signal-text-primary antialiased`}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
