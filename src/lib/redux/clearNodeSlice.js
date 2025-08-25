import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connectionStatus: 'disconnected', // 'disconnected', 'connecting', 'connected', 'error'
  isAuthenticated: false,
  error: null,
  channels: [], // Store fetched channels here if needed
  // Add more as needed, e.g., ledgerBalances, config
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
    // Add reducers for other data, e.g., setLedgerBalances, setConfig
  },
});

export const {
  setConnectionStatus,
  setAuthenticated,
  setError,
  setChannels,
} = clearNodeSlice.actions;

export default clearNodeSlice.reducer;