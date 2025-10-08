import Sortable, { MultiDrag, Swap } from "sortablejs";
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";
import { moveTask } from "../redux/todoSlice";
import { Task } from "../types";

Sortable.mount(new MultiDrag(), new Swap());

const useDnd = (selectedFolder: string, finalTodos: Task[]) => {
  const [isDragging, setIsDragging] = useState(false);
  const sortableInstance = useRef<Sortable | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const list = document.getElementsByClassName("todo-list-collapse");

    if (!list || list.length === 0) {
      return;
    }

    const todoList = list[0];

    if (!todoList || !(todoList instanceof HTMLElement)) return;

    // Destroy existing instance if it exists
    if (sortableInstance.current) {
      sortableInstance.current.destroy();
      sortableInstance.current = null;
    }

    // Create new Sortable instance
    sortableInstance.current = Sortable.create(todoList, {
      animation: 200,
      handle: ".drag-handle",
      chosenClass: "drag-selected",
      ghostClass: "sortable-ghost",
      dragClass: "sortable-drag",
      forceFallback: false,
      fallbackOnBody: true,
      swapThreshold: 0.65,
      onStart: (event) => {
        setIsDragging(true);
        // Add visual feedback
        event.item.style.opacity = "0.5";
      },
      onEnd: (event) => {
        const { oldIndex, newIndex } = event;
        
        // Reset visual state
        event.item.style.opacity = "";
        setIsDragging(false);
        
        // Only dispatch if the position actually changed
        if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
          dispatch(
            moveTask({
              from: oldIndex,
              to: newIndex,
              categoryId: selectedFolder,
            }),
          );
        }
      },
      onMove: (event) => {
        // Allow dropping on any valid target
        return event.related?.dataset?.allowDrop !== "false";
      },
      onUpdate: () => {
        // This fires when the DOM is updated, useful for cleanup
      },
    });

    return () => {
      if (sortableInstance.current) {
        sortableInstance.current.destroy();
        sortableInstance.current = null;
      }
    };
  }, [selectedFolder, finalTodos.length, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sortableInstance.current) {
        sortableInstance.current.destroy();
        sortableInstance.current = null;
      }
    };
  }, []);

  return { isDragging };
};

export default useDnd;
