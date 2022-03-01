import SocketProvider from '@src/Components/SocketProvider'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <SocketProvider>
        <Component {...pageProps} />
      </SocketProvider>
    </>
  )
}

export default MyApp
