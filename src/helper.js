import { v4 as uuidv4 } from "uuid";

export const arrayMove = (array, from, to) => {
  const result = Array.from(array);
  const startIndex = from < 0 ? result.length + from : from;
  const endIndex = to < 0 ? result.length + to : to;
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export const createId = () => {
  return uuidv4();
};

export const getNewTask = (order = 1) => {
  return {
    id: uuidv4(),
    text: "",
    isCompleted: false,
    subtasks: [],
    parentId: null,
    order,
    startTime: undefined,
    endTime: undefined,
  };
};

export const getNewSubtask = ({ parentId, order = 1, text = "" }) => {
  return {
    id: uuidv4(),
    text,
    isCompleted: false,
    parentId,
    order,
    subtasks: [],
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
