import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connectionStatus: 'disconnected', // 'disconnected', 'connecting', 'connected', 'error'
  isAuthenticated: false,
  error: null,
  channels: {
    channels: []
  }, // Store fetched channels here if needed
  ledgerBalances: {}, // Store fetched ledger balances here
  // Add more as needed, e.g., config
};

const clearNodeSlice = createSlice({
  name: 'clearNode',
  initialState,
  reducers: {
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setChannels: (state, action) => {
      state.channels = action.payload;
    },
    setLedgerBalances: (state, action) => {
      state.ledgerBalances = action.payload;
    },
    // Add reducers for other data, e.g., setConfig
  },
});

export const {
  setConnectionStatus,
  setAuthenticated,
  setError,
  setChannels,
  setLedgerBalances,
} = clearNodeSlice.actions;

export default clearNodeSlice.reducer;