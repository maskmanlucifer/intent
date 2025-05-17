/* eslint-disable no-undef */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getNewSubtask, getNewTask } from "../helper";
import { createSelector } from "reselect";
import { Task } from "../types";
import { RootState } from "./store";
import { getTodos } from "../db";
import dbHelper from "../db/helper";

const initialState = {
  // Store tasks by categoryId
  itemsByCategory: {} as Record<string, Task[]>,
  activeItem: null as string | null,
};

export const fetchTodos = createAsyncThunk("todos/fetchTodos", async () => {
  const todos = await getTodos();
  return todos;
});

// Helper function to reorder tasks in a category
const reorderTasksInCategory = (tasks: Task[]) => {
  return tasks.map((task, index) => ({ ...task, order: index }));
};

// Helper function to handle task state change ordering
const orderTasksByCompletionStatus = (tasks: Task[]) => {
  const incompleteTasks = tasks.filter((task) => !task.isCompleted);
  const completedTasks = tasks.filter((task) => task.isCompleted);

  // Maintain continuous ordering across both groups
  return [
    ...incompleteTasks.map((task, index) => ({ ...task, order: index })),
    ...completedTasks.map((task, index) => ({
      ...task,
      order: incompleteTasks.length + index,
    })),
  ];
};

const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    updateTaskText: (state, action) => {
      const { id, text, parentId, isSubtask, categoryId } = action.payload;
      let parentFinalTodo = undefined;

      if (isSubtask) {
        const categoryTasks = state.itemsByCategory[categoryId] || [];

        state.itemsByCategory[categoryId] = categoryTasks.map((todo) => {
          if (todo.id === parentId) {
            parentFinalTodo = {
              ...todo,
              subtasks: todo.subtasks.map((subtask) =>
                subtask.id === id ? { ...subtask, text } : subtask,
              ),
            };
            return parentFinalTodo;
          }
          return todo;
        });
      } else {
        const categoryTasks = state.itemsByCategory[categoryId] || [];

        state.itemsByCategory[categoryId] = categoryTasks.map((task) => {
          if (task.id === id) {
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
      const { id, categoryId } = action.payload;

      const categoryTasks = state.itemsByCategory[categoryId] || [];
      const updatedTasks = categoryTasks.filter((todo) => todo.id !== id);

      state.itemsByCategory[categoryId] = reorderTasksInCategory(updatedTasks);

      dbHelper.deleteTodo(id);
      dbHelper.upsertTasks(state.itemsByCategory[categoryId]);
    },
    deleteAllCompletedCategoryTasks: (state, action) => {
      const { categoryId } = action.payload;
      const categoryTasks = state.itemsByCategory[categoryId] || [];
      const updatedTasks = categoryTasks.filter((todo) => !todo.isCompleted);
      state.itemsByCategory[categoryId] = reorderTasksInCategory(updatedTasks);

      dbHelper.deleteAllCompletedTasks(categoryTasks.map((task) => task.id));
    },
    deleteSubtask: (state, action) => {
      const { id, parentId, categoryId } = action.payload;
      let parentFinalTodo = undefined;

      const categoryTasks = state.itemsByCategory[categoryId] || [];
      const parentTodo = categoryTasks.find((todo) => todo.id === parentId);

      if (!parentTodo) return;

      const indexOfSubtask = parentTodo.subtasks.findIndex(
        (subtask) => subtask.id === id,
      );

      if (indexOfSubtask === -1) return;

      const updatedSubtasks = parentTodo.subtasks.filter(
        (subtask) => subtask.id !== id,
      );

      state.itemsByCategory[categoryId] = categoryTasks.map((todo) => {
        if (todo.id === parentId) {
          parentFinalTodo = { ...todo, subtasks: updatedSubtasks };
          return parentFinalTodo;
        }
        return todo;
      });

      const previousSubtask = updatedSubtasks[indexOfSubtask - 1];
      state.activeItem = previousSubtask ? previousSubtask.id : parentId;

      if (parentFinalTodo) {
        dbHelper.updateTodo(parentFinalTodo);
      }
    },
    toggleTaskState: (state, action) => {
      const { id, parentId, isSubtask, categoryId } = action.payload;
      const categoryTasks = state.itemsByCategory[categoryId] || [];

      if (isSubtask) {
        let parentTask = null;
        let parentCompletionChanged = false;

        state.itemsByCategory[categoryId] = categoryTasks.map((todo) => {
          if (todo.id === parentId) {
            const updatedSubtasks = todo.subtasks.map((subtask) =>
              subtask.id === id
                ? { ...subtask, isCompleted: !subtask.isCompleted }
                : subtask,
            );

            // Check if all subtasks are completed
            const allSubtasksCompleted = updatedSubtasks.every(
              (subtask) => subtask.isCompleted,
            );

            parentCompletionChanged = allSubtasksCompleted && !todo.isCompleted;

            parentTask = {
              ...todo,
              subtasks: updatedSubtasks,
              isCompleted: allSubtasksCompleted ? true : todo.isCompleted,
            };

            return parentTask;
          }
          return todo;
        });

        if (parentCompletionChanged) {
          state.itemsByCategory[categoryId] = orderTasksByCompletionStatus(
            state.itemsByCategory[categoryId],
          );
        }

        if (parentTask) {
          dbHelper.updateTodo(parentTask);

          if (parentCompletionChanged) {
            dbHelper.upsertTasks(state.itemsByCategory[categoryId]);
          }
        }

        return;
      }

      const taskToUpdate = categoryTasks.find((task) => task.id === id);
      if (!taskToUpdate) return;

      const newCompletionState = !taskToUpdate.isCompleted;

      const updatedCategoryTasks = categoryTasks.map((task) =>
        task.id === id ? { ...task, isCompleted: newCompletionState } : task,
      );

      state.itemsByCategory[categoryId] =
        orderTasksByCompletionStatus(updatedCategoryTasks);

      dbHelper.updateTodo({
        ...taskToUpdate,
        isCompleted: newCompletionState,
      });

      dbHelper.upsertTasks(state.itemsByCategory[categoryId]);
    },
    addNewTask: (state, action) => {
      const { categoryId, order } = action.payload;

      const categoryTasks = [...(state.itemsByCategory[categoryId] || [])];

      const newTask = getNewTask(categoryId, order);

      const updatedTasks = [
        ...categoryTasks.slice(0, order),
        newTask,
        ...categoryTasks.slice(order),
      ];

      const reorderedTasks = updatedTasks.map((task, idx) => ({
        ...task,
        order: idx,
      }));

      state.itemsByCategory = {
        ...state.itemsByCategory,
        [categoryId]: reorderedTasks,
      };

      state.activeItem = newTask.id;

      const tasksToSave = [...reorderedTasks];
      dbHelper.upsertTasks(tasksToSave);
    },
    addNewSubtask: (state, action) => {
      const { parentId, index = -1, categoryId } = action.payload;
      const newSubtask = getNewSubtask({ parentId });
      let parentFinalTodo = undefined;
      const categoryTasks = state.itemsByCategory[categoryId] || [];

      state.itemsByCategory[categoryId] = categoryTasks.map((todo) => {
        if (todo.id === parentId) {
          const newSubtasks = [...todo.subtasks];
          const insertIndex = index >= 0 ? index + 1 : 0;
          newSubtasks.splice(insertIndex, 0, newSubtask);
          parentFinalTodo = { ...todo, subtasks: newSubtasks };
          return parentFinalTodo;
        }
        return todo;
      });

      if (parentFinalTodo) {
        dbHelper.updateTodo(parentFinalTodo);
      }

      state.activeItem = newSubtask.id;
    },
    clearCompletedTasks: (state) => {
      Object.keys(state.itemsByCategory).forEach((categoryId) => {
        const categoryTasks = state.itemsByCategory[categoryId] || [];
        const incompleteTasks = categoryTasks.filter(
          (task) => !task.isCompleted,
        );
        const completedTasks = categoryTasks.filter((task) => task.isCompleted);

        state.itemsByCategory[categoryId] =
          reorderTasksInCategory(incompleteTasks);

        dbHelper.deleteAllCompletedTasks(completedTasks.map((task) => task.id));
      });
    },
    moveTask: (state, action) => {
      const { from, to, categoryId } = action.payload;
      const categoryTasks = state.itemsByCategory[categoryId] || [];

      if (categoryTasks.length === 0) return;

      const updatedItems = [...categoryTasks];
      const adjustedTo =
        to < 0 ? 0 : to >= updatedItems.length ? updatedItems.length - 1 : to;

      const [itemToMove] = updatedItems.splice(from, 1);
      updatedItems.splice(adjustedTo, 0, itemToMove);

      state.itemsByCategory[categoryId] = reorderTasksInCategory(updatedItems);

      dbHelper.upsertTasks(state.itemsByCategory[categoryId]);
    },
    changeCategoryOfTask: (state, action) => {
      const { id, sourceCategoryId, destinationCategoryId } = action.payload;

      const sourceCategoryTasks = state.itemsByCategory[sourceCategoryId] || [];
      const destinationCategoryTasks =
        state.itemsByCategory[destinationCategoryId] || [];

      const taskToMove = sourceCategoryTasks.find((task) => task.id === id);

      if (!taskToMove) return;

      const updatedSourceTasks = sourceCategoryTasks.filter(
        (task) => task.id !== id,
      );

      state.itemsByCategory[sourceCategoryId] = reorderTasksInCategory(
        updatedSourceTasks,
      );

      const updatedTask = { ...taskToMove, categoryId: destinationCategoryId };

      let updatedDestinationTasks;
      if (updatedTask.isCompleted) {
        updatedDestinationTasks = [...destinationCategoryTasks, updatedTask];
      } else {
        const incompleteTasksCount = destinationCategoryTasks.filter(
          (t) => !t.isCompleted,
        ).length;
        updatedDestinationTasks = [
          ...destinationCategoryTasks.slice(0, incompleteTasksCount),
          updatedTask,
          ...destinationCategoryTasks.slice(incompleteTasksCount),
        ];
      }

      state.itemsByCategory[destinationCategoryId] =
        orderTasksByCompletionStatus(updatedDestinationTasks);

      dbHelper.updateTodo(updatedTask);
      dbHelper.upsertTasks(state.itemsByCategory[sourceCategoryId]);
      dbHelper.upsertTasks(state.itemsByCategory[destinationCategoryId]);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTodos.fulfilled, (state, action) => {
      const todos = action.payload as Task[];

      const tasksByCategory = {} as Record<string, Task[]>;

      todos.forEach((todo) => {
        const categoryId = todo.categoryId;
        if (!tasksByCategory[categoryId]) {
          tasksByCategory[categoryId] = [];
        }
        tasksByCategory[categoryId].push(todo);
      });

      Object.keys(tasksByCategory).forEach((categoryId) => {
        tasksByCategory[categoryId] = tasksByCategory[categoryId].sort(
          (a, b) => a.order - b.order,
        );
      });

      state.itemsByCategory = tasksByCategory;
    });
  },
});

export const selectTodoList = createSelector(
  (state: RootState) => state.todos.itemsByCategory,
  (state: RootState, categoryId: string) => categoryId,
  (itemsByCategory, categoryId) => {
    if (!categoryId) {
      const allTasks = Object.values(itemsByCategory).flat();
      return [...allTasks].sort((a, b) => a.order - b.order);
    }

    return (itemsByCategory[categoryId] || []).map((todo) => ({
      ...todo,
      subtasks: [...todo.subtasks],
    }));
  },
);

export const selectCompletedTodoListWithoutFolder = createSelector(
  (state: RootState) => Object.values(state.todos.itemsByCategory).flat(),
  (todos) =>
    todos.filter((todo) => todo.isCompleted).sort((a, b) => a.order - b.order),
);

export const selectCompletedTodoListLength = createSelector(
  selectTodoList,
  (items) => items.filter((todo) => todo.isCompleted).length,
);

export const selectCompletedTodoList = createSelector(selectTodoList, (items) =>
  items.filter((todo) => todo.isCompleted).sort((a, b) => a.order - b.order),
);

export const selectActiveTodo = (state: RootState) => state.todos.activeItem;

export const {
  updateTaskText,
  toggleTaskState,
  addNewTask,
  addNewSubtask,
  clearCompletedTasks,
  deleteTask,
  deleteSubtask,
  changeCategoryOfTask,
  moveTask,
  deleteAllCompletedCategoryTasks,
} = todoSlice.actions;

export default todoSlice.reducer;
