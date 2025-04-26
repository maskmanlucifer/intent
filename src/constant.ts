export const PAGES = {
  TODO: "Todo",
  NOTES: "Notes",
  BREAK: "Break",
} as const;

export const TODAY_CATEGORY_ID = "1";

export const TIME_IN_MS = {
  DAY: 1000 * 60 * 60 * 24,
}

export const LINKBOARD_FILTER_OPTIONS = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Webpage",
    value: "webpage",
  },
  {
    label: "Image",
    value: "image",
  },
  {
    label: "Video",
    value: "video",
  },
];

export const DB_CONFIG = {
  name: "intent",
  version: 2,
  stores: {
    todos: {
      name: "todos",
      keyPath: "id",
    },
    notes: {
      name: "notes",
      keyPath: "id",
    },
    categories: {
      name: "categories",
      keyPath: "id",
    },
    calendarEvents: {
      name: "calendarEvents",
      keyPath: "id",
    },
    sessionData: {
      name: "sessionData",
      keyPath: "id",
    },
    settings: {
      name: "settings",
      keyPath: "id",
    },
    linkboard: {
      name: "linkboard",
      keyPath: "id",
    }
  },
};

export const PAGE_SWITCHER_OPTIONS = Object.values(PAGES)
  .filter((option) => option !== PAGES.BREAK)
  .map((option) => ({
    label: option,
    value: option,
  }));

export const MESSAGE_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
};

export const KEYBOARD_SHORTCUTS = [
  {
    key: "Enter",
    description: "Add a new task",
  },
  {
    key: "Tab",
    description: "Change task to subtask",
  },
  {
    key: "⌫",
    description: "Delete task",
  },
  {
    key: "▲",
    description: "Navigate task up",
  },
  {
    key: "▼",
    description: "Navigate task down",
  },
  {
    key: "⌘ + Enter",
    description: "Toggle task state",
  },
];

export const BREAK_TIME_DURATIONS = [5, 10, 20, 30];

export const SONGS = {
  JAZZ: [
    {
      title: "1st",
      src: "https://ia801207.us.archive.org/25/items/calm-jazz-music-cafe-music/Calm%20Jazz%20Music%E2%A7%B8Caf%C3%A9%20Music.Mp3",
      index: 0,
    },
    {
      title: "2nd",
      src: "https://ia801008.us.archive.org/23/items/untitled_20190826/Untitled.mp3",
      index: 1,
    },
    {
      title: "3rd",
      src: "https://ia803000.us.archive.org/21/items/SleepJazzSoothingJazzMusicRelaxingJazzMusicBackgroundJazzMusic/Jazz%20Music%20%20Smooth%20Jazz%20Saxophone%20%20Relaxing%20Background%20Music%20with%20the%20Sound%20of%20Ocean%20Waves.mp3",
      index: 2,
    },
  ],
  NATURE: [
    {
      title: "1st",
      src: "https://dn720300.ca.archive.org/0/items/nature-sounds_202104/02%20Hour%20Relaxing.mp3",
      index: 0,
    },
    {
      title: "3rd",
      src: "https://dn720300.ca.archive.org/0/items/nature-sounds_202104/%5BMP3FY%5D%20Morning%20on%20the%20River%20and%20the%20gentle%20singing%20of%20spring%20birds.mp3",
      index: 1,
    },
  ],
  LO_FI: [
    {
      title: "1st",
      src: "https://stream.chillhop.com/mp3/22791",
      index: 0,
    },
    {
      title: "2nd",
      src: "https://stream.chillhop.com/mp3/22792",
      index: 1,
    },
    {
      title: "3rd",
      src: "https://stream.chillhop.com/mp3/22793",
      index: 2,
    },
    {
      title: "4th",
      src: "https://stream.chillhop.com/mp3/22794",
      index: 3,
    },
    {
      title: "6th",
      src: "https://stream.chillhop.com/mp3/22790",
      index: 5,
    },
  ],
};