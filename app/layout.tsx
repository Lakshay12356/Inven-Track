import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Inven Track - Inventory Management',
  description: 'Modern inventory management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-sans antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}