import { createSlice } from "@reduxjs/toolkit";
import { PAGES } from "../constant";
import { RootState } from "./store";
import { Pages } from "../types";

type SessionState = {
    activePage: Pages;
};

const initialState: SessionState = {
    activePage: PAGES.TODO,
};

const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        setActivePage: (state, action) => {
            state.activePage = action.payload;
        }
    },
});

export const { setActivePage } = sessionSlice.actions;

export const selectActivePage = (state: RootState) => state.session.activePage;

export default sessionSlice.reducer;