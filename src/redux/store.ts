/* eslint-disable no-undef */
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import todoReducer from "./todoSlice";
import categoryReducer from "./categorySlice";
import sessionReducer from "./sessionSlice";
import linkboardReducer from "./linkboardSlice";

const rootReducer = combineReducers({
  todos: todoReducer,
  categories: categoryReducer,
  session: sessionReducer,
  linkboard: linkboardReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
