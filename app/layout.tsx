// src/app/layout.tsx
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import '../styles/index.css';
import QueryProvider from '@/providers/query-provider';
import { I18nProvider } from '@/providers/i18n-provider';
import { Toaster } from '@/components/ui/sonner';
import { ReactNode } from 'react';

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Clear Sight',
  description: 'Govern. Enforce. Prove.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${roboto.variable} bg-background text-foreground min-h-screen font-sans antialiased`}>
        <I18nProvider>
          <QueryProvider>
            {children}
            <Toaster richColors position="top-right" closeButton />
          </QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
