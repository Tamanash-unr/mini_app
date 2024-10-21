import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    id: "",
    nickname: "",
    friendsCount: 0,
    data: null,
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setNickname: (state, action) => {
            state.nickname = action.payload
        },
        setId: (state, action) => {
            state.id = action.payload
        },
        setUserData: (state, action) => {
            state.data = action.payload
        },
    }
})

export const { setNickname, setId, setUserData } = userSlice.actions

export default userSlice.reducer