import type { Metadata } from 'next';

import { Cascadia_Code, Abril_Fatface } from 'next/font/google';

import './globals.css';

function DevIndicator() {
  if (process.env.NODE_ENV === 'production') return null;

  return <div className="dev-indicator" />;
}

// const roboto_mono = Roboto_Mono({
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-roboto-mono',
// })

const cascadiaCode = Cascadia_Code({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-cascadia-code',
  weight: '400',
});

const abrilFatface = Abril_Fatface({
  weight: '400',
  variable: '--font-abril-fatface',
});

export const metadata: Metadata = {
  title: 'Pelita Tournament',
  description: 'ASPP2025',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cascadiaCode.variable} ${abrilFatface.variable}`}>
        <DevIndicator />
        {children}
      </body>
    </html>
  );
}
