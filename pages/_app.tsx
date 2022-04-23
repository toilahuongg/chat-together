import type { AppProps } from 'next/app';
import { useState } from 'react';
import Router from 'next/router';
import { ToastContainer } from 'react-toastify';
import TopBarProgress from 'react-topbar-progress-indicator';


import SocketProvider from '@src/Components/SocketProvider';

import 'react-toastify/dist/ReactToastify.css';
import '@src/styles/main.scss';
import AppProvider from '@src/Components/AppProvider';

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
      <SocketProvider>
        <AppProvider>
          <Component {...pageProps} />
        </AppProvider>
      </SocketProvider>
    </>
  )
}

export default MyApp
