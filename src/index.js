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
import { mockTelegramEnv, parseInitDataQuery } from '@telegram-apps/sdk-react';

let err = "";

try {
  // const initDataRaw = new URLSearchParams([
  //   ['user', JSON.stringify({
  //     id: 99281932,
  //     first_name: 'Andrew',
  //     last_name: 'Rogue',
  //     username: 'rogue',
  //     language_code: 'en',
  //     is_premium: true,
  //     allows_write_to_pm: true,
  //   })],
  //   ['hash', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
  //   ['auth_date', '1716922846'],
  //   ['start_param', 'debug'],
  //   ['chat_type', 'sender'],
  //   ['chat_instance', '8428209589180549439'],
  // ]).toString();
  
  // mockTelegramEnv({
  //   themeParams: {
  //     accentTextColor: '#6ab2f2',
  //     bgColor: '#17212b',
  //     buttonColor: '#5288c1',
  //     buttonTextColor: '#ffffff',
  //     destructiveTextColor: '#ec3942',
  //     headerBgColor: '#17212b',
  //     hintColor: '#708499',
  //     linkColor: '#6ab3f3',
  //     secondaryBgColor: '#232e3c',
  //     sectionBgColor: '#17212b',
  //     sectionHeaderTextColor: '#6ab3f3',
  //     subtitleTextColor: '#708499',
  //     textColor: '#f5f5f5',
  //   },
  //   initData: parseInitDataQuery(initDataRaw),
  //   initDataRaw,
  //   version: '7.2',
  //   platform: 'tdesktop',
  // });

  telegramAnalytics.init({
      token: process.env.REACT_APP_ANALYTICS_RECORDING_TOKEN, // SDK Auth token received via @DataChief_bot
      appName: process.env.REACT_APP_ANALYTICS_IDENTIFIER, // The analytics identifier you entered in @DataChief_bot
      env: 'PROD'
  });
} catch (error) {
  err = error
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
              <App test={err}/>
          </TonConnectUIProvider>
        </Provider>
      </BrowserRouter>
  </React.StrictMode>
);
