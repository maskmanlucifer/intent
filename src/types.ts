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
  sidebarCollapsed: boolean;
  selectedFolder: string;
  activePage: Pages;
  lastUpdatedAt: number;
  focusedTaskId: string | null;
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
