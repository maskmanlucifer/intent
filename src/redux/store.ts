/* eslint-disable no-undef */
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import todoReducer from "./todoSlice";
import categoryReducer from "./categorySlice";
import sessionReducer from "./sessionSlice";
import eventsReducer from "./eventsSlice";
import linkboardReducer from "./linkboardSlice";
import reminderReducer from "./reminderSlice";

const rootReducer = combineReducers({
  todos: todoReducer,
  categories: categoryReducer,
  session: sessionReducer,
  events: eventsReducer,
  linkboard: linkboardReducer,
  reminders: reminderReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
