import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Presupuestador SaaS',
  description: 'Generador rápido de presupuestos en PDF para WhatsApp',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-100 min-h-screen text-gray-900">{children}</body>
    </html>
  );
}