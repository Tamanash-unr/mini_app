import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    id: "",
    nickname: "",
    friendsCount: 0,
    data: {
        is_bot: false,
        first_name: '',
        last_name: '',
        username: '',
        is_premium: false,
        photo_url: '',
        allows_write_to_pm: false,
        language_code: ''
    },
    test: null,
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
            // state.data = {...action.payload}
            state.test = action.payload
        },
    }
})

export const { setNickname, setId, setUserData } = userSlice.actions

export default userSlice.reducer