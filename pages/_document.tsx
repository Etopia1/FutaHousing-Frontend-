import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <link rel="icon" href="/logo.png" />
                {/* Optional: Add search bar color for mobile */}
                <meta name="theme-color" content="#4f46e5" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
