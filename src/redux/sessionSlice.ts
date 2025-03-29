import { createSlice } from "@reduxjs/toolkit";
import { RootState, store } from "./store";
import { TUserSettingsData } from "../types";
import { PAGES } from "../constant";
import { getTabId } from "../utils";

export const syncSettings = (newSettings: Partial<TUserSettingsData>) => {
    const existingSettings = store.getState().session;

    const finalSettings = {
        ...existingSettings,
        ...newSettings,
        lastUpdatedAt: Date.now(),
    };

    store.dispatch(updateSettings(finalSettings));

    if(chrome.storage) {
        chrome.storage.local.set({ intentSettings: finalSettings });
    }
}
if(chrome.storage) {
    chrome.storage.onChanged.addListener((changes) => {
        if(changes.intentSettings && changes.intentSettings.newValue && changes.intentSettings.newValue.lastUpdatedAt !== store.getState().session.lastUpdatedAt) {
            store.dispatch(updateSettings(changes.intentSettings.newValue));
        }
    });
}

const initialState: TUserSettingsData = {
    icalUrl: '',
    workingHours: ['09:00', '17:00'],
    breakInterval: 90,
    showCustomAudioPlayer: false,
    musicMode: 'NATURE',
    sidebarCollapsed: true,
    selectedFolder: "1",
    activePage: PAGES.TODO,
    isMusicPlaying: false,
    tabId: getTabId(),
    lastUpdatedAt: Date.now(),
    songIndex: 0,
    enableVisualBreakReminder: true,
    sendBreakReminder: true,
    sendEventReminder: true,
};

const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        updateSettings: (state, action) => {
            return {
                ...state,
                ...action.payload,
            }
        },
    },
});

export const { updateSettings } = sessionSlice.actions;

export const selectActivePage = (state: RootState) => state.session.activePage;
export const selectIsMusicPlaying = (state: RootState) => state.session.isMusicPlaying;
export const selectMusicMode = (state: RootState) => state.session.musicMode;
export const selectShowMusicWidget = (state: RootState) => state.session.showCustomAudioPlayer;
export const selectTabId = (state: RootState) => state.session.tabId;
export const selectSettings = (state: RootState) => state.session;
export const selectIsSidebarCollapsed = (state: RootState) => state.session.sidebarCollapsed;
export const selectSendEventReminder = (state: RootState) => state.session.sendEventReminder;
export const selectSendBreakReminder = (state: RootState) => state.session.sendBreakReminder;
export const selectEnableVisualBreakReminder = (state: RootState) => state.session.enableVisualBreakReminder;

export default sessionSlice.reducer;