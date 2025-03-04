import { v4 as uuidv4 } from "uuid";
import { Category, Task } from "./types";
import { Subtask } from "./types";

export const arrayMove = <T>(array: T[], from: number, to: number): T[] => {
  const result = Array.from(array);
  const startIndex = from < 0 ? result.length + from : from;
  const endIndex = to < 0 ? result.length + to : to;
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export const createId = (): string => {
  return uuidv4();
};

export const getNewTask = (order = 1, categoryId: string): Task => {
  return {
    id: uuidv4(),
    text: "",
    isCompleted: false,
    subtasks: [],
    parentId: null,
    order,
    isSubtask: false,
    categoryId,
  };
};

export const getNewSubtask = ({ parentId, text = "" }: { parentId: string, text?: string }): Subtask => {
  return {
    id: uuidv4(),
    text,
    isCompleted: false,
    parentId,
    order: 1,
    subtasks: [],
    isSubtask: true,
    categoryId: "",
  };
};

export const createNewNote = () => {
  return {
    id: uuidv4(),
    title: "",
    subtitle: "",
    data: "{}",
    createdAt: new Date().toISOString(),
  };
};

export const getNewCategory = (name: string): Category => {
  return {
    id: uuidv4(),
    name,
  };
};
