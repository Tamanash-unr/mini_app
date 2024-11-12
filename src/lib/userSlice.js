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
        language_code: ''
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
        },
        setNickname: (state, action) => {
            state.nickname = action.payload
        },
        setId: (state, action) => {
            state.id = action.payload
        },
        setUserData: (state, action) => {
            state.data.id = (action.payload.id).toString()
            state.data.first_name = action.payload.first_name
            state.data.last_name = action.payload.last_name
            state.data.is_premium = action.payload.is_premium
            state.data.username = action.payload.username
            state.data.photo_url = action.payload.photo_url
            state.data.language_code = action.payload.language_code
        },
        updateBoostLevel: (state, action) => {
            state.boostLevel = action.payload
        },
    }
})

export const { setNickname, setId, setUserData, updateBoostLevel, initUserData } = userSlice.actions

export default userSlice.reducer