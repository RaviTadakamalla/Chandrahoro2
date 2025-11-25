import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* PWA Meta Tags */}
        <meta name="application-name" content="JoytishDrishti" />
        <meta name="apple-mobile-web-app-title" content="JoytishDrishti" />
        <meta name="description" content="Professional Vedic astrology chart generation and analysis" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}