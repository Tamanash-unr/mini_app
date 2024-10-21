import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    id: "",
    nickname: "",
    friendsCount: 0,
    data: {
        isBot: false,
        firstName: '',
        lastName: '',
        userName: '',
        is_premium: false,
        photo_url: '',
        allows_write_to_pm: false,
    }
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
            state.id = action.payload.id;
            state.data.firstName = action.payload.first_name;
            state.data.lastName = action.payload.last_name;
            state.data.userName = action.payload.username;
            state.data.isBot = action.payload.is_bot;
            state.data.is_premium = action.payload.is_premium;
            state.data.allows_write_to_pm = action.payload.allows_write_to_pm;
            state.data.photo_url = action.payload.photo_url;
        },
    }
})

export const { setNickname, setId, setUserData } = userSlice.actions

export default userSlice.reducer