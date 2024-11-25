import { createSlice } from "@reduxjs/toolkit";

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
        }
    }
})

export const { setNickname, setId, setUserData, updateBoostLevel, initUserData, setReferralId } = userSlice.actions

export default userSlice.reducer