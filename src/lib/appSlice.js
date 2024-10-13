import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentTab: 'dashboard',
    coinValue: 2000,
    earnTab: 'tasks',
}

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setCurrentTab: (state, action) => {
            state.currentTab = action.payload
        },
        updateCoins: (state, action) => {
            state.coinValue += action.payload
        },
        setEarnTab: (state, action) => {
            state.earnTab = action.payload
        },
    } 
})

export const { setCurrentTab, updateCoins, setEarnTab } = appSlice.actions

export default appSlice.reducer