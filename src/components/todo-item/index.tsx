import React, { useState, useRef, useEffect } from "react";
import { Checkbox, CheckboxChangeEvent } from "antd";
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
import TextArea from "antd/es/input/TextArea";

const makeLinksClickable = (text: string) => {
  const urlRegex = /(\bhttps?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) =>
    urlRegex.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        style={{ color: "#1677ff", textDecoration: "underline" }}
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
};

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
  const [editing, setEditing] = useState(false);
  const activeItem = useSelector(selectActiveTodo);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    setIsCompleted(todoItem.isCompleted);
  }, [todoItem.isCompleted]);

  useEffect(() => {
    if (activeItem === todoItem.id) {
      setText(todoItem.text);
      setEditing(true);
      setTimeout(() => {
        textareaRef.current?.focus();
      });
    }
  }, [activeItem, todoItem.id, todoItem.text]);

  const handleBlur = () => {
    setEditing(false);
  };

  const handleClickOutsideLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  return (
    <div className="todo-item">
      <Checkbox
        onChange={handleCheckboxChange}
        onClick={(event) => {
          event.stopPropagation();
          setIsCompleted(!isCompleted);
        }}
        checked={isCompleted}
        className="checkbox"
      />
      {editing ? (
        <TextArea
          ref={textareaRef}
          value={text}
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
          onFocus={(event) => {
            event.stopPropagation();
            // Move cursor to end
            const textarea = event.target as HTMLTextAreaElement;
            const value = textarea.value;
            textarea.setSelectionRange(value.length, value.length);
          }}
          onBlur={handleBlur}
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
              setEditing(false);
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
              } else if (
                "subtasks" in todoItem &&
                Array.isArray(todoItem.subtasks) &&
                todoItem.subtasks.length === 0
              ) {
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
          spellCheck={false}
          autoSize={{ minRows: 1, maxRows: 10 }}
        />
      ) : (
        <div
          className="editable-text"
          onClick={handleClickOutsideLink}
          tabIndex={0}
        >
          {text.trim() === "" ? (
            <span style={{ color: "#b0b0b0" }}>
              {todoItem.isSubtask
                ? "Enter subtask details"
                : "Enter task details"}
            </span>
          ) : (
            makeLinksClickable(text)
          )}
        </div>
      )}
    </div>
  );
};

export default TodoItem;
