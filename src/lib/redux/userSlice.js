import { createSlice } from "@reduxjs/toolkit";
import { CLEAR_DAILY, CLEAR_SOCIAL } from './actionTypes';

const initialState = {
    nickname: "",
    friendsCount: 0,
    boostLevel: 0,
    data: {
        id: null,
        first_name: '',
        last_name: '',
        username: '',
        is_premium: false,
        photo_url: '',
        language_code: '',
        referredBy: '',
        referralId: '',
        referrals: [],
        referralReward: 0,
    },
    tasks: {
        daily: {},
        social: {}
    },
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        initUserData: (state, action) => {
            state.nickname = action.payload.nickname
            state.friendsCount = action.payload.friendsCount
            state.boostLevel = action.payload.boostLevel
            state.data.referralId = action.payload.referralId
            state.data.referrals = action.payload.referrals
            state.data.referredBy = action.payload.referredBy
            state.data.referralReward = action.payload.referralReward
        },
        setNickname: (state, action) => {
            state.nickname = action.payload
        },
        setId: (state, action) => {
            state.id = action.payload
        },
        setUserData: (state, action) => {
            state.data = {...action.payload}
        },
        updateBoostLevel: (state, action) => {
            state.boostLevel = action.payload
        },
        setReferralId: (state, action) => {
            state.data.referralId = action.payload
        },
        populateTasks: (state, action) => {
            switch(action.payload.type) {
                case CLEAR_DAILY:
                    state.tasks.daily = {}
                    state.tasks.social = action.payload.data.tasks.social ?? {}
                    break
                case CLEAR_SOCIAL:
                    state.tasks.daily = action.payload.data.tasks.daily ?? {}
                    state.tasks.social = {}
                    break
                default:
                    state.tasks.daily = action.payload.data.tasks.daily ?? {}
                    state.tasks.social = action.payload.data.tasks.social ?? {}
            }
        },
        updateCompletedTask: (state, action) => {
            const task = {
                completed: true,
                claimed: false
            }

            if(action.payload.type === 'daily'){
                state.tasks.daily[action.payload.taskId] = task
            } else {
                state.tasks.social[action.payload.taskId] = task
            }
        },
        updateClaimedTask: (state, action) => {
            if(action.payload.type === 'daily'){
                state.tasks.daily[action.payload.taskId] = {completed: false, claimed: true}
            } else {
                state.tasks.social[action.payload.taskId] = {completed: false, claimed: true}
            }
        },
        resetReferralReward: (state, action) => {
            state.data.referralReward = 0
        }
    }
})

export const { 
    setNickname, 
    setId, 
    setUserData, 
    updateBoostLevel, 
    initUserData, 
    setReferralId, 
    updateCompletedTask, 
    updateClaimedTask,
    populateTasks,
    resetReferralReward
 } = userSlice.actions

export default userSlice.reducer