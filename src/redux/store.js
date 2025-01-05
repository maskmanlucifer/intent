/* eslint-disable no-undef */
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import todoReducer from "./todoSlice";

export async function rehydrateStore() {
  const persistedState = await storage.getItem('persist:root');
  if (persistedState) {
    const parsedState = JSON.parse(persistedState);
    store.dispatch({
      type: 'TODO_REHYDRATE',
      payload: {
        todos: JSON.parse(parsedState.todos),
      },
    });
  }
}

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, todoReducer);

export const store = configureStore({
  reducer: {
    todos: persistedReducer,
  },
});

export const persistor = persistStore(store);
