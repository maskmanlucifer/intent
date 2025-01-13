export const PAGES = {
  TODO: "Todo",
  NOTES: "Notes",
  BREAK: "Break",
};

export const PAGE_SWITCHER_OPTIONS = Object.values(PAGES)
  .filter((option) => option !== PAGES.BREAK)
  .map((option) => ({
    label: option,
    value: option,
  }));

export const TODO_LIST_LIMIT = 5;

export const MESSAGE_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
};

export const KEYBOARD_SHORTCUTS = [
  {
    key: "ENTER",
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
    key: "↑",
    description: "Navigate task up",
  },
  {
    key: "↓",
    description: "Navigate task down",
  },
  {
    key: "⌘ + ENTER",
    description: "Toggle task state",
  }
];

export const BREAK_TIME_DURATIONS = [5, 10, 20, 30];
