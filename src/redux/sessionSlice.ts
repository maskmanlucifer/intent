import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { TSessionData, TSettings } from "../types";
import { setItem } from "../db/localStorage";
import { PAGES } from "../constant";

type SessionState = {
    settings: TSettings;
    sessionData: Omit<TSessionData, 'id'>;
};

const initialState: SessionState = {
    settings: {
        icalUrl: '',
        workingHours: ['09:00', '17:00'],
        breakInterval: 90,
    },
    sessionData: {
        sidebarCollapsed: true,
        selectedFolder: "1",
        activePage: PAGES.TODO,
    },
};

const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        setActivePage: (state, action) => {
            const sessionData = {
                ...state.sessionData,
                activePage: action.payload,
            };
            state.sessionData = sessionData;
            setItem("sessionData", sessionData);
        },
        setSettings: (state, action) => {
            const finalSettings = {
                ...state.settings,
                ...action.payload,
            };  
            state.settings = finalSettings;
            setItem("settings", finalSettings);
        },
        setSessionData: (state, action) => {
            const finalSessionData = {
                ...state.sessionData,
                ...action.payload,
            };
            state.sessionData = finalSessionData;
            setItem("sessionData", finalSessionData);
        }
    },
});

export const { setActivePage, setSettings, setSessionData } = sessionSlice.actions;

export const selectActivePage = (state: RootState) => state.session.sessionData.activePage;
export const selectSettings = (state: RootState) => state.session.settings;
export const selectSessionData = (state: RootState) => state.session.sessionData;

export default sessionSlice.reducer;