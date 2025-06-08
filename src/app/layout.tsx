import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { BottomNavigationBar } from '@/components/app/bottom-navigation-bar';
import { Web3ModalProvider } from '@/components/providers/Web3ModalProvider';

export const metadata: Metadata = {
  title: 'AnonTrade',
  description: 'P2P Crypto Trading Telegram Mini App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Web3ModalProvider>
          {children}
          <Toaster />
          <BottomNavigationBar />
        </Web3ModalProvider>
      </body>
    </html>
  );
}
