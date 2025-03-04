/* eslint-disable no-undef */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getNewSubtask, getNewTask } from "../helper";
import { createSelector } from "reselect";
import { Task } from "../types";
import { RootState } from "./store";
import { getTodos } from "../db";
import dbHelper from "../db/helper";
const initialState = {
  items: [] as Task[],
  activeItem: null as string | null,
};

export const fetchTodos = createAsyncThunk(
  "todos/fetchTodos",
  async () => {
    const todos = await getTodos();
    return todos;
  }
);

const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    updateTaskText: (state, action) => {
      const { id, text, parentId, isSubtask } = action.payload;
      let parentFinalTodo = undefined;

      if (isSubtask) {
        state.items = state.items.map((todo) => {
          if(todo.id === parentId) {
            parentFinalTodo = { ...todo, subtasks: todo.subtasks.map((subtask) => subtask.id === id ? { ...subtask, text } : subtask) };
            return parentFinalTodo;
          }
          return todo;
        });
      } else {
        state.items = state.items.map((task) => {
          if(task.id === id) {
            parentFinalTodo = { ...task, text };
            return parentFinalTodo;
          }
          return task;
        });
      }

      if (parentFinalTodo) {
        dbHelper.updateTodo(parentFinalTodo);
      }
    },
    deleteTask: (state, action) => {
      const { id } = action.payload;
      state.items = state.items.filter((todo) => todo.id !== id).map((todo, index) => ({ ...todo, order: index + 1 }));
      dbHelper.deleteTodo(id);
    },
    deleteSubtask: (state, action) => {
      const { id, parentId } = action.payload;
      let parentFinalTodo  = undefined;

      const parentTodo = state.items.find((todo) => todo.id === parentId);

      if (!parentTodo) return;

      const indexOfSubtask = parentTodo.subtasks.findIndex((subtask) => subtask.id === id);

      if (indexOfSubtask === -1) return;

      const updatedSubtasks = parentTodo.subtasks.filter((subtask) => subtask.id !== id);

      const updatedTodos = state.items.map((todo) =>{ 
        if(todo.id === parentId) {
          parentFinalTodo = { ...todo, subtasks: updatedSubtasks };
          return parentFinalTodo;
        }
        return todo;
      });

      const previousSubtask = updatedSubtasks[indexOfSubtask - 1];

      state.activeItem = previousSubtask ? previousSubtask.id : parentId;

      state.items = updatedTodos;


      if (parentFinalTodo) {
        dbHelper.updateTodo(parentFinalTodo);
      }
    },
    toggleTaskState: (state, action) => {
      const { id, parentId, isSubtask } = action.payload;

      let parentFinalTodo = undefined;

      if (isSubtask) {
        state.items = state.items.map((todo) => {
          if(todo.id === parentId) {
            parentFinalTodo = { ...todo, subtasks: todo.subtasks.map((subtask) => subtask.id === id ? { ...subtask, isCompleted: !subtask.isCompleted } : subtask) };
            return parentFinalTodo;
          }
          return todo;
        });

        const parentTodo = state.items.find((todo) => todo.id === parentId);
        
        const allSubtasksCompleted = parentTodo?.subtasks.every(
          (subtask) => subtask.isCompleted,
        );

        if (allSubtasksCompleted && parentTodo && parentTodo.isCompleted === false) {
          state.items = state.items.map((todo) =>
            todo.id === parentId ? { ...todo, isCompleted: true } : todo,
          );

          parentFinalTodo = { ...parentTodo, isCompleted: true };
        }

        if (parentFinalTodo) {
          dbHelper.updateTodo(parentFinalTodo);
        }
        return;
      }


      state.items = state.items.map((todo) => {
        if(todo.id === id) {
          parentFinalTodo = { ...todo, isCompleted: !todo.isCompleted };
          return parentFinalTodo;
        }
        return todo;
      });

      if (parentFinalTodo) {
        dbHelper.updateTodo(parentFinalTodo);
      }
    },
    addNewTask: (state, action) => {
      const { categoryId, order } = action.payload;
      const newOrder = order ? (order + 1) : state.items.length + 1;
      const newTask = getNewTask(newOrder, categoryId);

      // Reassign orders for existing tasks
      state.items = state.items.map((todo) => {
        if (todo.order >= newOrder) {
          return { ...todo, order: todo.order + 1 };
        }
        return todo;
      });

      state.items = [...state.items, newTask];
      state.activeItem = newTask.id;

      dbHelper.upsertTasks(state.items);
    },
    addNewSubtask: (state, action) => {
      const { parentId, index = -1 } = action.payload;
      const newSubtask = getNewSubtask({ parentId });

      let parentFinalTodo = undefined;

      state.items = state.items.map((todo) =>
      {
        if(todo.id === parentId) {
          const newSubtasks = [...todo.subtasks];
          const insertIndex = index >= 0 ? index + 1 : 0;
          newSubtasks.splice(insertIndex, 0, newSubtask);
          parentFinalTodo = { ...todo, subtasks: newSubtasks };
          return parentFinalTodo;
        }
        return todo;
      }
      );

      if (parentFinalTodo) {
        dbHelper.updateTodo(parentFinalTodo);
      }

      state.activeItem = newSubtask.id;
    },
    clearCompletedTasks: (state) => {
      const completedTasks = state.items.filter((todo) => todo.isCompleted);
      state.items = state.items.filter((todo) => !todo.isCompleted);
      dbHelper.deleteAllCompletedTasks(completedTasks.map((todo) => todo.id));
    },
    moveTaskUp: (state, action) => {
      const { id, order } = action.payload;

      if (order === 1) return;

      const currentTask = state.items.find((todo) => todo.id === id);
      const prevTask = state.items.find((todo) => todo.order === order - 1);

      state.items = state.items.map((todo) => {
        if (todo.id === currentTask?.id) {
          return { ...todo, order: order - 1 };
        }
        if (todo.id === prevTask?.id) {
          return { ...todo, order: order };
        }
        return todo;
      });

      dbHelper.upsertTasks(state.items);

      state.activeItem = id;
    },
    moveTaskDown: (state, action) => {
      const { id, order } = action.payload;

      if (order === state.items.length) return;

      const currentTask = state.items.find((todo) => todo.id === id); 
      const nextTask = state.items.find((todo) => todo.order === order + 1);

      state.items = state.items.map((todo) => {
        if (todo.id === currentTask?.id) {
          return { ...todo, order: order + 1 };
        }
        if (todo.id === nextTask?.id) {
          return { ...todo, order: order };
        }
        return todo;
      });

      dbHelper.upsertTasks(state.items);

      state.activeItem = id;
    },  
    changeCategoryOfTask: (state, action) => {
      const { id, categoryId } = action.payload;

      let updatedTodo = undefined;

      state.items = state.items.map((todo) => {
        if(todo.id === id) {
          updatedTodo = { ...todo, categoryId };
          return updatedTodo;
        }
        return todo;
      });
      
      if (updatedTodo) {
        dbHelper.updateTodo(updatedTodo);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTodos.fulfilled, (state, action) => {
      state.items = action.payload as Task[];
    });
  },
});

export const selectCompletedTodoListWithoutFolder = createSelector(
  (state: { todos: { items: Task[] } }) => state.todos.items,
  (todos) => todos.filter((todo) => todo.isCompleted)
);

export const selectTodoList = createSelector(
  (state: { todos: { items: Task[] } }) => state.todos.items,
  (state: { todos: { items: Task[] } }, categoryId: string) => categoryId,
  (todos, categoryId) =>
    [...todos]
      .filter(todo => !categoryId || todo.categoryId === categoryId)
      .sort((a, b) => a.order - b.order)
      .map((todo) => ({
        ...todo,
        subtasks: [...todo.subtasks].sort((a, b) => a.order - b.order),
      })),
);

export const selectCompletedTodoListLength = createSelector(
  selectTodoList,
  (items) => items.filter((todo) => todo.isCompleted).length,
);

export const selectCompletedTodoList = createSelector(
  selectTodoList,
  (items) => items.filter((todo) => todo.isCompleted),
);

export const selectActiveTodo = (state: RootState) => state.todos.activeItem;

export const {
  updateTaskText,
  toggleTaskState,
  addNewTask,
  addNewSubtask,
  clearCompletedTasks,
  moveTaskUp,
  deleteTask,
  moveTaskDown,
  deleteSubtask,
  changeCategoryOfTask
} = todoSlice.actions;

export default todoSlice.reducer;
