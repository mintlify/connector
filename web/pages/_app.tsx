import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { IntercomProvider } from 'react-use-intercom';
import { INTERCOM_APP_ID } from '../services/intercom';
import { ProfileContextProvider } from '../context/ProfileContex';

function App({ Component, pageProps }: AppProps) {
  return (
    <ProfileContextProvider>
      <IntercomProvider appId={INTERCOM_APP_ID}>
        <Component {...pageProps} />
      </IntercomProvider>
    </ProfileContextProvider>
  )
}

export default App
