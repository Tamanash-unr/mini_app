import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentTab: 'dashboard',
    coinValue: 0,
    tickets: 0,
    earnTab: 'tasks',
    minedCoins: 0,
    mineState: 0,
    miningStartedAt: '',
    boostRate: 0,
    earnedFromGame: 0,
    modalOpen: false,
    modalChild: null,
    dailyClaimed: false,
    dailyStreak: 0,
    isLoading: false,
    startParam: null,
    miningDuration: 8,
    currentMiningDuration: 0,
    userRank: [
        {
            name: "Beginner",
            style: "bg-gradient-to-br from-green-300 to-green-700",
            icon: "fa-solid fa-chess-pawn mx-2"
        },
        {
            name: "Pro",
            style: "bg-gradient-to-br from-yellow-50 to-yellow-400",
            icon: "fa-solid fa-chess-rook mx-2"
        },
        {
            name: "Epic",
            style: "bg-gradient-to-br from-indigo-400 to-indigo-700",
            icon: "fa-solid fa-chess-knight mx-2"
        },
        {
            name: "Legendary",
            style: "bg-gradient-to-br from-amber-300 to-amber-600",
            icon: "fa-solid fa-chess-king mx-2"
        }
    ],
    sessionId: crypto.randomUUID()
}

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        initAppData: (state, action) => {
            state.coinValue = action.payload.coinsEarned
            state.tickets = action.payload.tickets ?? 0

            if (action.payload.isMining) {
                const currentTime = new Date()
                const startedAt = new Date(action.payload.miningStartedAt)

                const elapsed = Math.floor((currentTime - startedAt) / 1000)
                const totalTime = (state.miningDuration * 60 * 60)
                const finalElapsed = elapsed > totalTime ? totalTime : elapsed

                state.minedCoins = finalElapsed * 0.1;
                state.currentMiningDuration = finalElapsed;
                state.mineState = 1;
            }

            const today = new Date()
            const lastLogin = new Date(action.payload.lastLoggedIn)

            if (today.getDate() === lastLogin.getDate()) {
                state.dailyClaimed = true
            }

            state.dailyStreak = today.getDate() === 1 ? 1 : action.payload.dailyStreak

            const rate = parseFloat((1 + (0.15 * parseInt(action.payload.boostLevel))).toFixed(2))
            state.boostRate = rate
        },
        setStartParam: (state, action) => {
            state.startParam = action.payload
        },
        setCurrentTab: (state, action) => {
            state.currentTab = action.payload
        },
        updateCoins: (state, action) => {
            const coin = parseFloat((state.coinValue + action.payload).toFixed(2))
            state.coinValue = coin
        },
        updateTickets: (state, action) => {
            state.tickets += action.payload
        },
        setEarnTab: (state, action) => {
            state.earnTab = action.payload
        },
        updateMineState: (state, action) => {
            state.mineState = action.payload

            switch (action.payload) {
                case 0:
                    state.currentMiningDuration = 0; // Reset current mining duration
                    break;
                case 1:
                    state.miningStartedAt = new Date().toString()
                    break;
                default:
                    return
            }
        },
        updateMinedCoins: (state, action) => {
            const value = action.payload;

            if (value < 0) {
                state.minedCoins = 0
            } else {
                let coin = state.boostRate > 0 ? value * state.boostRate : value;
                let final = state.minedCoins + coin

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
            state.dailyStreak += 1
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        updateCurrentMiningDuration: (state, action) => {
            state.currentMiningDuration += action.payload
        }
    }
})

export const {
    setCurrentTab,
    updateCoins,
    updateTickets,
    setEarnTab,
    updateMineState,
    updateMinedCoins,
    updateBoostRate,
    updateEarnedFromGame,
    setModalOpen,
    setDailyClaimed,
    setLoading,
    initAppData,
    setStartParam,
    updateCurrentMiningDuration,
} = appSlice.actions

export default appSlice.reducer