export const PAGES = {
  TODO: "Todo",
} as const;

export const TODAY_CATEGORY_ID = "1";

const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

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
  version: 4,
  stores: {
    todos: {
      name: "todos",
      keyPath: "id",
    },
    categories: {
      name: "categories",
      keyPath: "id",
    },
    sessionData: {
      name: "sessionData",
      keyPath: "id",
    },
    linkboard: {
      name: "linkboard",
      keyPath: "id",
    },
  },
};

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
  linkboard: {
    key: isMac ? "⌘ + m" : "Ctrl + m",
    description: "Open linkboard",
    binding: isMac ? "command+m" : "ctrl+m",
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
