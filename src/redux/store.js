/* eslint-disable no-undef */
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import todoReducer from "./todoSlice";
import notesReducer from "./notesSlice";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  todos: todoReducer,
  notes: notesReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
