import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Account Dashboard | Clipboard Health',
  description: 'Account management dashboard for Collections Account Managers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)]">
        {children}
      </body>
    </html>
  );
}
