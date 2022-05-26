import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { IntercomProvider } from 'react-use-intercom';
import { INTERCOM_APP_ID } from '../services/intercom';

function App({ Component, pageProps }: AppProps) {
  return (
    <IntercomProvider appId={INTERCOM_APP_ID}>
      <Component {...pageProps} />
    </IntercomProvider>
  )
}

export default App
