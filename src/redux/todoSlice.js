/* eslint-disable no-undef */
import { createSlice } from "@reduxjs/toolkit";
import { arrayMove, getNewSubtask, getNewTask } from "../helper";
import { createSelector } from "reselect";

const initialState = {
  items: [],
  activeItem: null,
};

const clearAlarm = (id) => {
  chrome.storage.local.get(["alarms"], (data) => {
    const alarms = data.alarms || {};
    delete alarms[id];
    chrome.storage.local.set({ alarms });
  });
};

const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    updateTaskText: (state, action) => {
      const { id, text, parentId, isSubtask } = action.payload;

      const updateText = (task) => (task.id === id ? { ...task, text } : task);

      if (isSubtask) {
        state.items = state.items.map((todo) =>
          todo.id === parentId
            ? { ...todo, subtasks: todo.subtasks.map(updateText) }
            : todo,
        );
      } else {
        state.items = state.items.map(updateText);
      }
    },
    deleteTask: (state, action) => {
      const { id, parentId, isSubtask, order } = action.payload;

      if (isSubtask) {
        state.items = state.items.map((todo) =>
          todo.id === parentId
            ? {
                ...todo,
                subtasks: todo.subtasks
                  .filter((subtask) => subtask.id !== id)
                  .map((subtask) =>
                    subtask.order > order
                      ? { ...subtask, order: subtask.order - 1 }
                      : subtask,
                  ),
              }
            : todo,
        );

        const parentTodo = state.items.find((todo) => todo.id === parentId);

        state.activeItem =
          parentTodo.subtasks.length > 0
            ? parentTodo.subtasks.find(
                (subtask) => subtask.order === Math.max(order - 1, 1),
              ).id
            : parentId;
      } else {
        const newTodos = state.items.filter((todo) => todo.id !== id);

        const todosWithOrderChange = newTodos.map((todo) =>
          todo.order > order ? { ...todo, order: todo.order - 1 } : todo,
        );

        state.items = todosWithOrderChange;

        const prevOrderTask = state.items.find(
          (todo) => todo.order === order - 1,
        );

        state.activeItem = prevOrderTask ? prevOrderTask.id : null;
      }

      if (chrome.alarms) {
        chrome.alarms.clear(id.toString());
        clearAlarm(id);
      }
    },
    toggleTaskState: (state, action) => {
      const { id, parentId, isSubtask } = action.payload;
      if (isSubtask) {
        state.items = state.items.map((todo) =>
          todo.id === parentId
            ? {
                ...todo,
                subtasks: todo.subtasks.map((subtask) =>
                  subtask.id === id
                    ? { ...subtask, isCompleted: !subtask.isCompleted }
                    : subtask,
                ),
              }
            : todo,
        );

        const parentTodo = state.items.find((todo) => todo.id === parentId);
        const allSubtasksCompleted = parentTodo.subtasks.every(
          (subtask) => subtask.isCompleted,
        );

        if (allSubtasksCompleted) {
          state.items = state.items.map((todo) =>
            todo.id === parentId ? { ...todo, isCompleted: true } : todo,
          );
        }

        return;
      }

      const task = state.items.find((todo) => todo.id === id);

      if (chrome.alarms && !task.isCompleted) {
        chrome.alarms.clear(id.toString());
        clearAlarm(id);
      }

      state.items = state.items.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo,
      );
    },
    changeTaskOrder: (state, action) => {
      const { sourceIndex, destinationIndex } = action.payload;
      state.items = arrayMove(state.items, sourceIndex, destinationIndex);
    },
    addNewTask: (state, action) => {
      const { order } = action.payload;
      const newTask = getNewTask(order);
      state.items = [...state.items, newTask];
      state.activeItem = newTask.id;
    },
    handleEnterKey: (state, action) => {
      const {
        parentId,
        isSubtask,
        order,
        id,
        text,
        isLastTask,
        isCursorAtStart,
      } = action.payload;

      if (isSubtask) {
        if (isLastTask && text === "") {
          const parentTodo = state.items.find((todo) => todo.id === parentId);

          state.items = state.items.map((todo) =>
            todo.id === parentId
              ? {
                  ...todo,
                  subtasks: todo.subtasks.filter(
                    (subtask) => subtask.id !== id,
                  ),
                }
              : todo,
          );

          const newTask = getNewTask(parentTodo.order + 1);

          state.items = [
            ...state.items.map((todo) =>
              todo.order > parentTodo.order
                ? { ...todo, order: todo.order + 1 }
                : todo,
            ),
            newTask,
          ];

          state.activeItem = newTask.id;
          return;
        }

        const newOrder = isCursorAtStart ? order : order + 1;

        const newSubtask = getNewSubtask({ parentId, order: newOrder });

        state.items = state.items.map((todo) =>
          todo.id === parentId
            ? {
                ...todo,
                subtasks: [
                  ...todo.subtasks.map((subtask) =>
                    subtask.order >= newOrder
                      ? { ...subtask, order: subtask.order + 1 }
                      : subtask,
                  ),
                  newSubtask,
                ],
              }
            : todo,
        );

        state.activeItem = newSubtask.id;
        return;
      }

      let newOrder = isCursorAtStart ? order : order + 1;

      const newTask = getNewTask(newOrder);

      state.items = [
        ...state.items.map((todo) =>
          todo.order >= newOrder ? { ...todo, order: todo.order + 1 } : todo,
        ),
        newTask,
      ];

      state.activeItem = newTask.id;
    },
    clearCompletedTasks: (state) => {
      const tasksToRemove = state.items.filter((todo) => todo.isCompleted);
      state.items = state.items.filter((todo) => !todo.isCompleted);

      tasksToRemove.forEach((task) => {
        if (chrome.alarms) {
          chrome.alarms.clear(task.id.toString());
          clearAlarm(task.id);
        }
      });
    },
    changeTaskTime: (state, action) => {
      const { id, parentId, startTime, endTime } = action.payload;

      const task = state.items.find((todo) => todo.id === id);

      if (task) {
        state.items = state.items.map((todo) =>
          todo.id === id
            ? { ...todo, startTime, endTime }
            : todo.id === parentId
              ? { ...todo, startTime, endTime }
              : todo,
        );
      }

      if (chrome.alarms) {
        chrome.alarms.clear(id.toString(), () => {
          const now = new Date();

          const aTime = new Date(endTime);

          const aHours = aTime.getHours();
          const aMinutes = aTime.getMinutes();

          const midnight = new Date(now.setHours(0, 0, 0, 0));

          const alarmTime = new Date(
            midnight.getTime() + aHours * 60 * 60 * 1000 + aMinutes * 60 * 1000,
          );

          if (alarmTime <= new Date()) {
            return;
          }

          chrome.alarms.create(id.toString(), {
            when: alarmTime.getTime(),
          });

          chrome.storage.local.get(["alarms"], (data) => {
            const alarms = data.alarms || {};
            alarms[id.toString()] = alarmTime.getTime();
            chrome.storage.local.set({ alarms });
          });
        });
      }

      state.items = state.items.sort((a, b) => {
        const aTime = new Date(a.startTime);
        const bTime = new Date(b.startTime);
        const aHours = aTime.getHours();
        const aMinutes = aTime.getMinutes();
        const bHours = bTime.getHours();
        const bMinutes = bTime.getMinutes();

        if (aHours === bHours) {
          return aMinutes - bMinutes;
        }
        return aHours - bHours;
      });

      state.items = state.items.map((todo, index) => ({
        ...todo,
        order: index + 1,
      }));

      state.activeItem = id;
    },
    moveCursor: (state, action) => {
      const { orderDelta, isSubtask, parentId, id, order } = action.payload;

      if (isSubtask) {
        if (order === 1 && orderDelta === -1) {
          state.activeItem = parentId;
          return;
        }

        if (orderDelta === -1 && order !== 1) {
          const prevSubtask = state.items
            .find((todo) => todo.id === parentId)
            .subtasks.find((subtask) => subtask.order === order - 1);
          state.activeItem = prevSubtask.id;
          return;
        }

        const parentTodo = state.items.find((todo) => todo.id === parentId);

        const subtaskLength = parentTodo.subtasks.length;

        if (
          orderDelta === 1 &&
          order === subtaskLength &&
          parentTodo.order === state.items.length
        ) {
          return;
        }

        if (
          orderDelta === 1 &&
          order === subtaskLength &&
          parentTodo.order !== state.items.length
        ) {
          const nextTask = state.items.find(
            (todo) => todo.order === parentTodo.order + 1,
          );
          state.activeItem = nextTask.id;
          return;
        }

        if (orderDelta === 1 && order === subtaskLength) {
          const nextTask = state.items.find(
            (todo) => todo.order === parentTodo.order + 1,
          );
          state.activeItem = nextTask ? nextTask.id : id;
          return;
        }

        const nextSubtask = parentTodo.subtasks.find(
          (subtask) => subtask.order === order + 1,
        );
        state.activeItem = nextSubtask.id;
        return;
      }

      if (order === 1 && orderDelta === -1) {
        return;
      }

      if (orderDelta === -1 && order !== 1) {
        const prevTask = state.items.find((todo) => todo.order === order - 1);
        const lastSubtask = prevTask.subtasks.find(
          (subtask) => subtask.order === prevTask.subtasks.length,
        );
        state.activeItem = lastSubtask ? lastSubtask.id : prevTask.id;
        return;
      }

      const taskLength = state.items.length;

      if (orderDelta === 1 && order === taskLength) {
        const firstSubtask = state.items
          .find((todo) => todo.order === 1)
          .subtasks.find((subtask) => subtask.order === 1);
        state.activeItem = firstSubtask ? firstSubtask.id : id;
      }

      const firstSubtask = state.items
        .find((todo) => todo.order === order)
        .subtasks.find((subtask) => subtask.order === 1);

      if (firstSubtask) {
        state.activeItem = firstSubtask.id;
        return;
      }

      const nextTask = state.items.find((todo) => todo.order === order + 1);
      state.activeItem = nextTask ? nextTask.id : id;
    },
    changeTaskToSubtask: (state, action) => {
      const { id, order, isSubtask, text } = action.payload;

      if (isSubtask || order === 1) {
        return;
      }

      const prevTask = state.items.find((todo) => todo.order === order - 1);

      const currentTask = state.items.find((todo) => todo.id === id);

      if (currentTask.subtasks.length > 0) {
        return;
      }

      if (chrome.alarms) {
        chrome.alarms.clear(id.toString());
        clearAlarm(id);
      }

      const newTask = getNewSubtask({
        parentId: prevTask.id,
        order: prevTask.subtasks.length + 1,
        text,
      });

      state.items = state.items.filter((todo) => todo.id !== id);

      state.items = state.items.map((todo) =>
        todo.id === prevTask.id
          ? {
              ...todo,
              subtasks: [...todo.subtasks, newTask],
            }
          : todo,
      );

      state.items = state.items.map((todo) =>
        todo.order > order ? { ...todo, order: todo.order - 1 } : todo,
      );

      state.activeItem = newTask.id;
    },
  },
});

export const selectTodoList = createSelector(
  (state) => state.todos.items,
  (todos) =>
    [...todos]
      .sort((a, b) => {
        if (a.isCompleted === b.isCompleted) {
          return new Date(a.startTime) - new Date(b.startTime);
        }
        return a.isCompleted ? 1 : -1;
      })
      .map((todo) => ({
        ...todo,
        subtasks: [...todo.subtasks].sort((a, b) => a.order - b.order),
      })),
);

export const selectNonCompletedTodoListLength = createSelector(
  selectTodoList,
  (items) => items.filter((todo) => !todo.isCompleted).length,
);

export const selectCompletedTodoListLength = createSelector(
  selectTodoList,
  (items) => items.filter((todo) => todo.isCompleted).length,
);

export const selectActiveTodo = (state) => state.todos.activeItem;

export const {
  updateTaskText,
  deleteTask,
  toggleTaskState,
  changeTaskOrder,
  addNewTask,
  changeTaskToSubtask,
  handleEnterKey,
  clearCompletedTasks,
  moveCursor,
  changeTaskTime,
} = todoSlice.actions;

export default todoSlice.reducer;
