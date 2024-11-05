import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentTab: 'dashboard',
    coinValue: 0,
    earnTab: 'tasks',
    minedCoins: 0,
    mineState: 0,
    boostRate: 0,
    earnedFromGame: 0,
    modalOpen: false,
    modalChild: null,
    dailyClaimed: false,
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
                let coin = state.boostRate > 0 ? value * state.boostRate : value;
                let final = state.minedCoins + coin
                final = Math.floor(final * 100) / 100
                
                state.minedCoins = parseFloat(final.toFixed(2));
            }
        },
        updateBoostRate: (state, action) => { 
            state.boostRate = action.payload
        },
        updateEarnedFromGame: (state, action) => {
            state.earnedFromGame = action.payload
        },
        setModalOpen: (state, action) => {
            state.modalOpen = action.payload.isOpen
            state.modalChild = action.payload.modalChild
        },
        setDailyClaimed: (state, action) => {
            state.dailyClaimed = action.payload
        },
    } 
})

export const { setCurrentTab, updateCoins, setEarnTab, updateMineState, updateMinedCoins, updateBoostRate, updateEarnedFromGame, setModalOpen, setDailyClaimed } = appSlice.actions

export default appSlice.reducer