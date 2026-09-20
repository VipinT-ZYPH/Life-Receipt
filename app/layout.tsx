import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'LIFE//RECEIPT — Your Life, In Receipts',
  description: 'An interactive digital archive transforming raw digital life fragments into observable patterns, derived connections, and cohesive chapters. Nothing happened in isolation.',
  openGraph: {
    title: 'LIFE//RECEIPT — Your Life, In Receipts',
    description: 'An interactive digital archive transforming raw digital life fragments into observable patterns, derived connections, and cohesive chapters. Nothing happened in isolation.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LIFE//RECEIPT — Your Life, In Receipts',
    description: 'An interactive digital archive transforming raw digital life fragments into observable patterns, derived connections, and cohesive chapters. Nothing happened in isolation.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
