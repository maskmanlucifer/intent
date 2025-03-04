import { createSlice } from "@reduxjs/toolkit";
import { PAGES } from "../constant";
import { RootState } from "./store";
import { Pages, TSessionData, TSettings } from "../types";
import { setItem } from "../db/localStorage";

type SessionState = {
    activePage: Pages;
    settings: TSettings;
    sessionData: Omit<TSessionData, 'id'>;
};

const initialState: SessionState = {
    activePage: PAGES.TODO,     
    settings: {
        icalUrl: '',
        workingHours: ['09:00', '17:00'],
        breakInterval: 90,
        sidebarCollapsed: false,
    },
    sessionData: {},
};

const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        setActivePage: (state, action) => {
            state.activePage = action.payload;
        },
        setSettings: (state, action) => {
            state.settings = action.payload;
            setItem("settings", action.payload);
        },
        setSessionData: (state, action) => {
            state.sessionData = action.payload;
            setItem("sessionData", action.payload);
        }
    },
});

export const { setActivePage, setSettings, setSessionData } = sessionSlice.actions;

export const selectActivePage = (state: RootState) => state.session.activePage;
export const selectSettings = (state: RootState) => state.session.settings;
export const selectSessionData = (state: RootState) => state.session.sessionData;

export default sessionSlice.reducer;