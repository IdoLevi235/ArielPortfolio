import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import SiteChrome from '@/components/SiteChrome';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'Ariel Levi — Portfolio',
  description: 'Video editor, motion designer & graphic designer based in Haifa. ',
  openGraph: {
    title: 'Ariel Levi — Portfolio',
    description: 'Video editor, motion designer & graphic designer based in Haifa. ',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable} data-scroll-behavior="smooth">
      <body>
        <SiteChrome>
          <Nav />
        </SiteChrome>
        <main style={{ maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%' }}>
          {children}
        </main>
        <SiteChrome>
          <Footer />
          <BackToTop />
        </SiteChrome>
      </body>
    </html>
  );
}
