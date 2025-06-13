import { Checkbox, CheckboxChangeEvent, Input, InputRef } from "antd";
import "./index.scss";
import { Task, Subtask } from "../../types";
import {
  addNewSubtask,
  addNewTask,
  deleteSubtask,
  deleteTask,
  selectActiveTodo,
  toggleTaskState,
  updateTaskText,
} from "../../redux/todoSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
const TodoItem = ({
  todoItem,
  index,
}: {
  todoItem: Task | Subtask;
  index: number;
}) => {
  const dispatch = useDispatch();
  const [text, setText] = useState(todoItem.text);
  const [isCompleted, setIsCompleted] = useState(todoItem.isCompleted);
  const activeItem = useSelector(selectActiveTodo);

  const inputRef = useRef<InputRef>(null);

  const handleCheckboxChange = (e: CheckboxChangeEvent) => {
    e.stopPropagation();
    setTimeout(() => {
      dispatch(
        toggleTaskState({
          id: todoItem.id,
          isSubtask: todoItem.isSubtask,
          parentId: todoItem.parentId,
          categoryId: todoItem.categoryId,
        }),
      );
    }, 350);
  };

  useEffect(() => {
    if (activeItem === todoItem.id) {
      setText(todoItem.text);
      inputRef.current?.focus();
    }
  }, [activeItem]);

  return (
    <div className="todo-item">
      <Checkbox
        onChange={handleCheckboxChange}
        onClick={(event) => {
          event.stopPropagation();
          setIsCompleted(!isCompleted);
        }}
        checked={isCompleted}
      />
      <Input
        onChange={(e) => {
          dispatch(
            updateTaskText({
              id: todoItem.id,
              text: e.target.value,
              parentId: todoItem.parentId,
              isSubtask: todoItem.isSubtask,
              categoryId: todoItem.categoryId,
            }),
          );
          setText(e.target.value);
        }}
        placeholder={
          todoItem.isSubtask ? "Enter subtask details" : "Enter task details"
        }
        onClick={(event) => event.stopPropagation()}
        onFocus={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Enter" && event.metaKey) {
            event.stopPropagation();
            event.preventDefault();
            dispatch(
              toggleTaskState({
                id: todoItem.id,
                isSubtask: todoItem.isSubtask,
                parentId: todoItem.parentId,
                categoryId: todoItem.categoryId,
              }),
            );
            return;
          }

          if (event.key === "Enter") {
            event.stopPropagation();
            event.preventDefault();

            if (todoItem.isSubtask) {
              dispatch(
                addNewSubtask({
                  parentId: todoItem.parentId,
                  index: index + 1,
                  categoryId: todoItem.categoryId,
                }),
              );
            } else {
              dispatch(
                addNewTask({
                  categoryId: todoItem.categoryId,
                  order: index + 1,
                }),
              );
            }
          }

          if (event.key === "Backspace" && text.trim() === "") {
            if (todoItem.isSubtask) {
              event.stopPropagation();
              event.preventDefault();
              dispatch(
                deleteSubtask({
                  id: todoItem.id,
                  parentId: todoItem.parentId,
                  categoryId: todoItem.categoryId,
                }),
              );
            } else if (todoItem.subtasks.length === 0) {
              event.stopPropagation();
              event.preventDefault();
              dispatch(
                deleteTask({
                  id: todoItem.id,
                  categoryId: todoItem.categoryId,
                }),
              );
            }
          }
        }}
        className="editable-text"
        ref={inputRef}
        bordered={false}
        spellCheck={false}
        value={text}
      />
    </div>
  );
};

export default TodoItem;
