export const PAGES = {
  TODO: "Todo",
  NOTES: "Notes",
  BREAK: "Break",
} as const;

export const TODAY_CATEGORY_ID = "1";

const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export const TIME_IN_MS = {
  DAY: 1000 * 60 * 60 * 24,
};

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
  version: 3,
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
    },
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

export const KEYBOARD_SHORTCUTS = {
  addTask: {
    key: "n",
    description: "Add a new task",
    binding: "n",
  },
  settings: {
    key: isMac ? "⌘ + ," : "Ctrl + ,",
    description: "Open settings",
    binding: isMac ? "command+," : "ctrl+,",
  },
  calendar: {
    key: isMac ? "⌘ + k" : "Ctrl + k",
    description: "Open calendar",
    binding: isMac ? "command+k" : "ctrl+k",
  },
  linkboard: {
    key: isMac ? "⌘ + l" : "Ctrl + l",
    description: "Open linkboard",
    binding: isMac ? "command+l" : "ctrl+l",
  },
  completeTask: {
    key: isMac ? "⌘ + Enter" : "Ctrl + Enter",
    description: "Mark task as completed",
    binding: isMac ? "command+enter" : "ctrl+enter",
  },
  toggleSidebar: {
    key: isMac ? "⌘ + b" : "Ctrl + b",
    description: "Toggle sidebar",
    binding: isMac ? "command+b" : "ctrl+b",
  },
  help: {
    key: "?",
    description: "Show shortcut guide",
    binding: "?",
  },
};

export const BREAK_TIME_DURATIONS = [5, 10, 20, 30];
