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
  musicMode: 'JAZZ' | 'NATURE' | 'LO_FI';
  lastCalendarFetchTime?: number;
  sidebarCollapsed: boolean;
  selectedFolder: string;
  activePage: Pages;
  isMusicPlaying: boolean;
  tabId: string;
  lastUpdatedAt: number;
  songIndex: number;
  sendEventReminder: boolean;
  sendBreakReminder: boolean;
  enableVisualBreakReminder: boolean;
  timezone: string | null;
  focusedTaskId: string | null;
}

export type Note = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  createdAt: number;
  isNewNote?: boolean;
  updatedAt: number;
};

export type TCalendarEvent = {
  id: string;
  uid: string;
  title: string;
  start: number;
  end: number;
  description: string;
}

export type TLink = {
  id: string;
  url: string;
  title?: string;
  imageUrl?: string;
  type: "webpage" | "image" | "video";
  createdAt: number;
};

export type Pages = (typeof PAGES)[keyof typeof PAGES];
