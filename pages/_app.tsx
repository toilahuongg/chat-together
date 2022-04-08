import type { AppProps } from 'next/app';
import TopBarProgress from 'react-topbar-progress-indicator';

import SocketProvider from '@src/Components/SocketProvider';

import '@src/styles/main.scss';
import { useState } from 'react';
import Router from 'next/router';

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
      {progress && <TopBarProgress />}
      <SocketProvider>
        <Component {...pageProps} />
      </SocketProvider>
    </>
  )
}

export default MyApp
