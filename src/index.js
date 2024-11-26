import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { store } from './lib/redux/store'
import { Provider } from 'react-redux'
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { Buffer } from 'buffer';

import './index.css';
import App from './App';

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
