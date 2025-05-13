import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { TLink } from "../types";
import { RootState, store } from "./store";
import dbHelper from "../db/helper";
import { getLinks } from "../db";

export const fetchLinks = createAsyncThunk("linkboard/fetchLinks", async () => {
  const links = await getLinks();
  return links;
});

if (chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "LINK_DATA_UPDATED") {
      store.dispatch(fetchLinks());
    }
  });
}

const initialState = {
  links: [] as TLink[],
};

const notesSlice = createSlice({
  name: "linkboard",
  initialState,
  reducers: {
    addLinks: (state, action) => {
      state.links = action.payload;
    },
    addLink: (state, action) => {
      state.links.push(action.payload);
      dbHelper.putLink(action.payload);
    },
    removeLink: (state, action) => {
      state.links = state.links.filter((link) => link.id !== action.payload);
      dbHelper.deleteLink(action.payload);
    },
    updateLink: (state, action) => {
      const index = state.links.findIndex(
        (link) => link.id === action.payload.id,
      );
      if (index !== -1) {
        state.links[index] = action.payload;
        dbHelper.putLink(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLinks.fulfilled, (state, action) => {
      state.links = action.payload as unknown as TLink[];
    });
  },
});

export const { addLink, removeLink, updateLink, addLinks } = notesSlice.actions;

export const selectLinks = (state: RootState) =>
  [...state.linkboard.links].sort((a, b) => {
    if (a.createdAt > b.createdAt) {
      return -1;
    }
    if (a.createdAt < b.createdAt) {
      return 1;
    }
    return 0;
  });

export default notesSlice.reducer;
