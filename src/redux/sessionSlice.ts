import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { TSessionData, TSettings } from "../types";
import { setItem } from "../db/localStorage";
import { PAGES } from "../constant";
import { getTabId } from "../utils";
type SessionState = {
    settings: TSettings;
    sessionData: Omit<TSessionData, 'id'>;
    tabId: string;
};

const initialState: SessionState = {
    settings: {
        icalUrl: '',
        workingHours: ['09:00', '17:00'],
        breakInterval: 90,
        showCustomAudioPlayer: false,
        musicMode: 'NATURE',
    },
    sessionData: {
        sidebarCollapsed: true,
        selectedFolder: "1",
        activePage: PAGES.TODO,
        isMusicPlaying: "0",
    },
    tabId: getTabId(),
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
        },
        setIsMusicPlaying: (state, action) => {
            const finalSessionData = {
                ...state.sessionData,
                isMusicPlaying: action.payload,
            };
            state.sessionData = finalSessionData;
        },
        setMusicMode: (state, action) => {
            const finalSettings = {
                ...state.settings,
                musicMode: action.payload,
            };
            state.settings = finalSettings;
            setItem("settings", finalSettings);
        },
        setShowMusicWidget: (state, action) => {
            const finalSettings = {
                ...state.settings,
                showCustomAudioPlayer: action.payload,
            };
            state.settings = finalSettings;
            setItem("settings", finalSettings);
        }
    },
});

export const { setActivePage, setSettings, setSessionData, setIsMusicPlaying, setMusicMode, setShowMusicWidget } = sessionSlice.actions;

export const selectActivePage = (state: RootState) => state.session.sessionData.activePage;
export const selectSettings = (state: RootState) => state.session.settings;
export const selectSessionData = (state: RootState) => state.session.sessionData;
export const selectIsMusicPlaying = (state: RootState) => state.session.sessionData.isMusicPlaying;
export const selectMusicMode = (state: RootState) => state.session.settings.musicMode;
export const selectShowMusicWidget = (state: RootState) => state.session.settings.showCustomAudioPlayer;
export const selectTabId = (state: RootState) => state.session.tabId;
export const selectIsPlayingFromSameTab = (state: RootState) => state.session.sessionData.isMusicPlaying === state.session.tabId;

export default sessionSlice.reducer;