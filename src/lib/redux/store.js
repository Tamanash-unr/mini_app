import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import appReducer from './appSlice'
import taskReducer from './taskSlice'
import clearNodeReducer from "./clearNodeSlice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    app: appReducer,
    tasks: taskReducer,
    clearNode: clearNodeReducer
  },
})