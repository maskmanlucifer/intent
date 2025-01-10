import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    notes: [],
};

const notesSlice = createSlice({
    name: 'notes',
    initialState,
    reducers: {
        addNote: (state, action) => {
            state.notes.push(action.payload);
        },
        removeNote: (state, action) => {
            state.notes = state.notes.filter(note => note.id !== action.payload);
        },
        updateNote: (state, action) => {
            const index = state.notes.findIndex(note => note.id === action.payload.id);
            if (index !== -1) {
                state.notes[index] = action.payload;
            }
        },
    },
});

export const { addNote, removeNote, updateNote } = notesSlice.actions;

export const selectNotes = state => state.notes.notes;

export const selectNote = (state, id) => state.notes.notes.find(note => note.id === id);

export default notesSlice.reducer;