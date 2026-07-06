import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Fundação Hubble',
  description: 'Plataforma de doações da Fundação Hubble',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}