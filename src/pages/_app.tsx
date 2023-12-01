import '../styles/globals.scss';
import type { AppProps } from 'next/app';
import Layout from '../components/layout';
import Head from 'next/head';

import '../styles/md5Phone.scss';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Layout>
            <Head>
                <title>洞窝桌面端</title>
            </Head>
            <Component {...pageProps} />
        </Layout>
    );
}
