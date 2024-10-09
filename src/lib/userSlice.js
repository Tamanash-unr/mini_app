import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    id: "",
    nickname: "",
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
        }
    }
})

export const { setNickname, setId } = userSlice.actions

export default userSlice.reducer