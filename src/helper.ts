import { v4 as uuidv4 } from "uuid";
import { Category, Task } from "./types";
import { Subtask } from "./types";

export const createId = (): string => {
  return uuidv4();
};

export const getNewTask = (categoryId: string, order: number): Task => {
  return {
    id: uuidv4(),
    text: "",
    isCompleted: false,
    subtasks: [],
    parentId: null,
    isSubtask: false,
    categoryId,
    order,
  };
};

export const getNewSubtask = ({
  parentId,
  text = "",
  categoryId,
}: {
  parentId: string;
  text?: string;
  categoryId: string;
}): Subtask => {
  return {
    id: uuidv4(),
    text,
    isCompleted: false,
    parentId,
    subtasks: [],
    isSubtask: true,
    categoryId,
  };
};

export const getNewCategory = (name: string): Category => {
  return {
    id: uuidv4(),
    name,
  };
};
