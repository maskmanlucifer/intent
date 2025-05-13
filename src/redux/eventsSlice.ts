import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TCalendarEvent } from "../types";

interface EventsState {
  events: TCalendarEvent[];
  isImporting: boolean;
}

const initialState: EventsState = {
  events: [],
  isImporting: false,
};

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    updateEvents(state, action: PayloadAction<TCalendarEvent[]>) {
      state.events = action.payload;
    },
    setIsImporting(state, action: PayloadAction<boolean>) {
      state.isImporting = action.payload;
    },
  },
});

export const { updateEvents, setIsImporting } = eventsSlice.actions;

export const selectEvents = (state: { events: EventsState }) =>
  state.events.events;

export const selectIsImporting = (state: { events: EventsState }) =>
  state.events.isImporting;

export default eventsSlice.reducer;
