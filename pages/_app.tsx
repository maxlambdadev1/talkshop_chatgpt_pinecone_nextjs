import '@/styles/base.css';
import type { AppProps as NextAppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from "next-themes"

type AppProps = NextAppProps & {
  session: Session;
};

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

function MyApp({ Component, pageProps, session }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider  attribute="class">
        <main className={inter.variable}>
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;
