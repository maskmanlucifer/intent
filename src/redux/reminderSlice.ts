import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TReminderEvent } from "../types";
import { store } from "./store";
import { getReminders } from "../db";

interface RemindersState {
  reminders: TReminderEvent[];
  isLoading: boolean | null;
}

export const fetchReminders = createAsyncThunk(
  "reminders/fetchReminders",
  async () => {
    const reminders = await getReminders();
    return reminders as TReminderEvent[];
  }
);

if (chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "REMINDER_DATA_UPDATED") {
      store.dispatch(fetchReminders());
    }
  });
}

const initialState: RemindersState = {
  reminders: [],
  isLoading: null,
};

const reminderSlice = createSlice({
  name: "reminders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchReminders.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchReminders.fulfilled, (state, action) => {
      state.isLoading = false;
      state.reminders = action.payload;
    });
    builder.addCase(fetchReminders.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export const selectReminders = (state: { reminders: RemindersState }) => state.reminders?.reminders || [];

export const selectIsLoading = (state: { reminders: RemindersState }) => state.reminders?.isLoading;

export default reminderSlice.reducer;
