export const PAGES = {
  TODO: "Todo",
  NOTES: "Notes",
  BREAK: "Break",
} as const;

export const TODAY_CATEGORY_ID = "1";

export const TIME_IN_MS = {
  DAY: 1000 * 60 * 60 * 24,
}

export const DB_CONFIG = {
  name: "intent",
  version: 1,
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
