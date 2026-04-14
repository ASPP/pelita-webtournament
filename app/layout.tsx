import type { Metadata } from 'next';

import localFont from "next/font/local";
import { Abril_Fatface } from 'next/font/google';

import './globals.css';
import { DebugMessagesProvider } from './debugmessages';

function DevIndicator() {
  if (process.env.NODE_ENV === 'production') return null;

  return <div className="dev-indicator" />;
}

// const roboto_mono = Roboto_Mono({
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-roboto-mono',
// })

export const cascadiaCode = localFont({
  src: [
    {
      path: "../public/fonts/cascadia/CascadiaCode-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/cascadia/CascadiaCode-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-cascadia-code",
  display: "swap",
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
        <DebugMessagesProvider>
          {children}
        </DebugMessagesProvider>
      </body>
    </html>
  );
}
