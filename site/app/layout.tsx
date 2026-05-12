import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'Ariel Levi — Portfolio',
  description: 'Video editor, motion designer & graphic designer based in Haifa. Creative Lead at Kendago.',
  openGraph: {
    title: 'Ariel Levi — Portfolio',
    description: 'Video editor, motion designer & graphic designer based in Haifa. Creative Lead at Kendago.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable} data-scroll-behavior="smooth">
      <body>
        <Nav />
        <main style={{ maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%' }}>
          {children}
        </main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
