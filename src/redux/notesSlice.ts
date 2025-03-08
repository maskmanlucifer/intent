import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Note } from "../types";
import { RootState } from "./store";
import dbHelper from "../db/helper";
import { getNotes } from "../db";


export const fetchNotes = createAsyncThunk('notes/fetchNotes', async () => {
  const notes = await getNotes();
  return notes;
});

const initialState = {
  items: [] as Note[],
};  

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    addNotes: (state, action) => {
      state.items = action.payload;
    },
    addNote: (state, action) => {
      state.items.push(action.payload);
      dbHelper.putNote(action.payload);
    },
    removeNote: (state, action) => {
      state.items = state.items.filter((note) => note.id !== action.payload);
      dbHelper.deleteNote(action.payload);
    },
    updateNote: (state, action) => {
      const index = state.items.findIndex(
        (note) => note.id === action.payload.id,
      );
      if (index !== -1) {
        state.items[index] = action.payload;
        dbHelper.putNote(action.payload);
      }
    },  
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotes.fulfilled, (state, action) => {
      state.items = action.payload as unknown as Note[];
    });
  },
});

export const { addNote, removeNote, updateNote, addNotes } = notesSlice.actions;

export const selectNotes = (state: RootState) => state.notes.items;

export const selectNote = (state: RootState, id: string) =>
  state.notes.items.find((note: Note) => note.id === id);

export default notesSlice.reducer;
