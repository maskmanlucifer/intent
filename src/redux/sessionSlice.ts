import { createSlice } from "@reduxjs/toolkit";
import { RootState, store } from "./store";
import { TUserSettingsData } from "../types";
import { PAGES } from "../constant";

export const syncSettings = (newSettings: Partial<TUserSettingsData>) => {
  const existingSettings = store.getState().session;

  const finalSettings = {
    ...existingSettings,
    ...newSettings,
    lastUpdatedAt: Date.now(),
  };

  store.dispatch(updateSettings(finalSettings));

  if (chrome.storage) {
    chrome.storage.local.set({ intentSettings: finalSettings });
  }
};
if (chrome.storage) {
  chrome.storage.onChanged.addListener((changes) => {
    if (
      changes.intentSettings &&
      changes.intentSettings.newValue &&
      changes.intentSettings.newValue.lastUpdatedAt !==
        store.getState().session.lastUpdatedAt
    ) {
      store.dispatch(updateSettings(changes.intentSettings.newValue));
    }
  });
}

if (chrome.storage) {
  chrome.storage.local.get("intentSettings", (data) => {
    if (data.intentSettings) {
      store.dispatch(
        updateSettings({
          ...store.getState().session,
          sidebarCollapsed: data.intentSettings.sidebarCollapsed,
        }),
      );
    }
  });
}

const initialState: TUserSettingsData = {
  sidebarCollapsed: true,
  selectedFolder: "1",
  activePage: PAGES.TODO,
  lastUpdatedAt: Date.now(),
  focusedTaskId: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    updateSettings: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const { updateSettings } = sessionSlice.actions;

export const selectActivePage = (state: RootState) => state.session.activePage;
export const selectSettings = (state: RootState) => state.session;
export const selectIsSidebarCollapsed = (state: RootState) =>
  state.session.sidebarCollapsed;
export const selectFocusedTaskId = (state: RootState) =>
  state.session.focusedTaskId;

export default sessionSlice.reducer;
