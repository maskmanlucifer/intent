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
  order: number;
  categoryId: string;
};

export type Subtask = {
  id: string;
  text: string;
  isCompleted: boolean;
  parentId: string;
  order: number;
  isSubtask: boolean;
  subtasks: Subtask[];
  categoryId: string;
};

export type TSettings = {
  icalUrl?: string;
  workingHours: [string, string];
  breakInterval: number;
  showCustomAudioPlayer: boolean;
  musicMode: 'JAZZ' | 'NATURE' | 'LO_FI';
}

export type TSessionData = {
  id: 'sessionData';
  lastCalendarFetchTime?: number;
  sidebarCollapsed: boolean;
  selectedFolder: string;
  activePage: Pages;
  isMusicPlaying?: string;
}

export type Note = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  createdAt: number;
  isNewNote?: boolean;
};

export type TCalendarEvent = {
  id: string;
  uid: string;
  title: string;
  start: number;
  end: number;
  description: string;
}

export type Pages = (typeof PAGES)[keyof typeof PAGES];
