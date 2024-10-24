import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentTab: 'dashboard',
    coinValue: 2000,
    earnTab: 'tasks',
    minedCoins: 0,
    mineState: 0,
    boostRate: 0,
    earnedFromGame: 0
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
        updateMineState: (state, action) => {
            state.mineState = action.payload
        },
        updateMinedCoins: (state, action) => {
            const value = action.payload;

            if(value < 0){
                state.minedCoins = 0
            } else {
                state.minedCoins += (state.boostRate > 0 ? value * state.boostRate : value);
            }
        },
        updateBoostRate: (state, action) => { 
            state.boostRate = action.payload
        },
        updateEarnedFromGame: (state, action) => {
            state.earnedFromGame = action.payload
        }
    } 
})

export const { setCurrentTab, updateCoins, setEarnTab, updateMineState, updateMinedCoins, updateBoostRate, updateEarnedFromGame } = appSlice.actions

export default appSlice.reducer