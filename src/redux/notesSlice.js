import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    addNote: (state, action) => {
      state.items.push(action.payload);
    },
    removeNote: (state, action) => {
      state.items = state.items.filter((note) => note.id !== action.payload);
    },
    updateNote: (state, action) => {
      const index = state.items.findIndex(
        (note) => note.id === action.payload.id,
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
  },
});

export const { addNote, removeNote, updateNote } = notesSlice.actions;

export const selectNotes = (state) => state.notes.items;

export const selectNote = (state, id) =>
  state.notes.items.find((note) => note.id === id);

export default notesSlice.reducer;
