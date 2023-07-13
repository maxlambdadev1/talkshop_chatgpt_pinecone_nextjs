import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="h-full">
      <Head />
      <body className="h-full m-0 p-0  bg-white dark:bg-gray-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
