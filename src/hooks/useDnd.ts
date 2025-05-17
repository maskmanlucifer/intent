import Sortable, { MultiDrag, Swap } from "sortablejs";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";
import { moveTask } from "../redux/todoSlice";
import { Task } from "../types";

Sortable.mount(new MultiDrag(), new Swap());

const INITIAL_DRAG_INDEX = { from: undefined, to: undefined };

const useDnd = (selectedFolder: string, finalTodos: Task[]) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<{ from?: number; to?: number }>(
    INITIAL_DRAG_INDEX,
  );
  
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const { from, to } = dragIndex;
    if (from !== undefined && to !== undefined) {
      setDragIndex(INITIAL_DRAG_INDEX);
    }
  }, [dragIndex]);

  useEffect(() => {
    const list = document.getElementsByClassName("todo-list-collapse");

    if (!list) {
      return;
    }

    const todoList = list[0];

    if (!todoList || !(todoList instanceof HTMLElement)) return;

    Sortable.create(todoList, {
      animation: 150,
      handle: ".drag-handle",
      chosenClass: "drag-selected",
      onEnd: function (event) {
        const { oldIndex, newIndex } = event;
        if (oldIndex !== undefined && newIndex !== undefined) {
          setDragIndex({ from: oldIndex, to: newIndex });
          setTimeout(() => {
            dispatch(
              moveTask({
                from: oldIndex,
                to: newIndex,
                categoryId: selectedFolder,
              }),
            );
          }, 100);
        }
        setIsDragging(false);
      },
      onStart: () => {
        setIsDragging(true);
      },
      onMove: (event) => {
        return event.related?.dataset?.allowDrop !== "false";
      },
    });

    return () => {
      Sortable.get(todoList)?.destroy();
    };
  }, [selectedFolder, dispatch, finalTodos.length]);

  return { isDragging };
};

export default useDnd;
