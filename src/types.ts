import { PAGES } from "./constant";

export type Category = {
  id: string;
  name: string;
  showCompletedTasks?: boolean;
};

export type Task = {
  id: string;
  text: string;
  isCompleted: boolean;
  subtasks: Subtask[];
  isSubtask: boolean;
  parentId: string | null;
  categoryId: string;
  order: number;
};

export type Subtask = {
  id: string;
  text: string;
  isCompleted: boolean;
  parentId: string;
  isSubtask: boolean;
  subtasks: Subtask[];
  categoryId: string;
};

export type TUserSettingsData = {
  icalUrl?: string;
  workingHours: string[];
  breakInterval: number;
  showCustomAudioPlayer: boolean;
  musicMode: "JAZZ" | "NATURE" | "LO_FI";
  lastCalendarFetchTime?: number;
  sidebarCollapsed: boolean;
  selectedFolder: string;
  activePage: Pages;
  isMusicPlaying: boolean;
  tabId: string;
  lastUpdatedAt: number;
  sendEventReminder: boolean;
  sendBreakReminder: boolean;
  timezone: string | null;
  focusedTaskId: string | null;
  activeReminders: TReminderEvent[];
};

export type TCalendarEvent = {
  id: string;
  uid: string;
  title: string;
  start: number;
  end: number;
  description: string;
};

export type TReminderEvent = {
  id: string;
  title: string;
  description?: string;
  date: string; // e.g., "2025-05-30"
  time: string; // e.g., "14:30"
  // Optional timezone info for correct local display
  timeZone?: string; // e.g., "Asia/Kolkata"
  // Recurrence config
  isRecurring: boolean;
  repeatRule?: string;
  repeatOn?: number[];
  updatedAt: number;
};

export type TLink = {
  id: string;
  url: string;
  title?: string;
  imageUrl?: string;
  type: "webpage" | "image" | "video";
  createdAt: number;
};

export type Pages = (typeof PAGES)[keyof typeof PAGES];
