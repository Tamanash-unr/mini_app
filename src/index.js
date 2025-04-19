import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { store } from './lib/redux/store'
import { Provider } from 'react-redux'
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { Buffer } from 'buffer';

import './index.css';
import App from './App';
import telegramAnalytics from '@telegram-apps/analytics';
// import { mockTelegramEnv, parseInitDataQuery } from '@telegram-apps/sdk-react';

let err = "";

try {
  telegramAnalytics.init({
      token: process.env.REACT_APP_ANALYTICS_RECORDING_TOKEN, // SDK Auth token received via @DataChief_bot
      appName: process.env.REACT_APP_ANALYTICS_IDENTIFIER, // The analytics identifier you entered in @DataChief_bot
      env: 'PROD'
  });
} catch (error) {
  console.error(error)
}

//Add buffer for Ton Core
window.Buffer = Buffer;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <BrowserRouter>
        <Provider store={store}>
          <TonConnectUIProvider manifestUrl='https://pink-working-snake-164.mypinata.cloud/ipfs/QmWJ8FPQ6tb9Ew3m1kRu98Rwo6w6n6KCFLt2xy7FNdy3gU'>
              <App />
          </TonConnectUIProvider>
        </Provider>
      </BrowserRouter>
  </React.StrictMode>
);
