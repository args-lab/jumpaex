
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { BottomNavigationBar } from '@/components/app/bottom-navigation-bar';
import { TanstackQueryProvider } from '@/components/providers/TanstackQueryProvider';
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
        <TanstackQueryProvider>
          <Web3ModalProvider>
            {children}
            <Toaster />
            {/* BottomNavigationBar might be part of individual page layouts or here if truly global */}
            {/* For now, assuming BottomNavigationBar is not always part of the core layout if some pages (like /connect) might not need it directly above content */}
          </Web3ModalProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
