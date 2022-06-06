import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import TopBarProgress from 'react-topbar-progress-indicator';
import AppProvider from '@src/Components/AppProvider';

import 'react-toastify/dist/ReactToastify.css';
import '@src/styles/main.scss';
dayjs.locale('vi');
dayjs.extend(relativeTime);



TopBarProgress.config({
  barColors: {
    0: '#00DA64',
    '1.0': '#00DA64',
  },
  shadowBlur: 5,
});


function MyApp({ Component, pageProps }: AppProps) {
  const [progress, setProgress] = useState(false);
  Router.events.on('routeChangeStart', () => {
    setProgress(true);
  });

  Router.events.on('routeChangeComplete', () => {
    setProgress(false);
  });
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/images/favicon.ico" />
      </Head>
      {progress && <TopBarProgress />}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <AppProvider>
        <Component {...pageProps} />
      </AppProvider>
    </>
  )
}

export default MyApp
