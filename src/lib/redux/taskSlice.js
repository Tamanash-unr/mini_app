import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    dailyTasks: null
}

export const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        initTasks: (state, action) => {
            state.dailyTasks = action.payload.daily_tasks
        },
    }
})

export const { initTasks } = taskSlice.actions

export default taskSlice.reducer