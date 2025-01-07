import { Checkbox } from "antd";
import "./index.scss";
import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import {
  changeTaskTime,
  changeTaskToSubtask,
  deleteTask,
  handleEnterKey,
  moveCursor,
  selectActiveTodo,
  selectNonCompletedTodoListLength,
  toggleTaskState,
  updateTaskText,
} from "../../redux/todoSlice";
import { useEffect, useRef, useState } from "react";
import { TODO_LIST_LIMIT } from "../../constant";
import DatePicker from "../time-range-picker";

const TodoItem = ({
  todo,
  onTodoDelete,
  isSubtask,
  onTodoToggle,
  onTodoTextChange,
  isLastTask,
  showMessage,
}) => {
  const activeTodo = useSelector(selectActiveTodo);
  const nonCompletedTodoListLength = useSelector(
    selectNonCompletedTodoListLength,
  );
  const {
    order,
    parentId,
    id,
    isCompleted,
    text,
    subtasks,
    startTime,
    endTime,
  } = todo;
  const inputRef = useRef(null);

  useEffect(() => {
    if (activeTodo === id) {
      document.getElementById(id).focus();
    }
  }, [activeTodo, id]);

  const dispatch = useDispatch();
  const [textContent, setTextContent] = useState(text);

  const handleKeyDown = (e) => {
    if (e.metaKey && e.key === "Enter") {
      e.preventDefault();
      handleTodoToggle();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (
        (!isSubtask && nonCompletedTodoListLength >= TODO_LIST_LIMIT) ||
        (isSubtask &&
          isLastTask &&
          textContent === "" &&
          nonCompletedTodoListLength >= TODO_LIST_LIMIT)
      ) {
        showMessage({
          type: "warning",
          content: `You can only add ${TODO_LIST_LIMIT} non completed tasks at a time`,
        });
        return;
      }
      dispatch(
        handleEnterKey({
          parentId,
          isSubtask,
          order,
          text: textContent,
          id,
          isLastTask,
          isCursorAtStart: inputRef.current.selectionStart === 0 && text,
        }),
      );
    }

    if (e.key === "Tab") {
      e.preventDefault();
      dispatch(
        changeTaskToSubtask({
          id: todo.id,
          parentId,
          isSubtask,
          order,
          text: textContent,
        }),
      );
    }

    if (e.key === "Backspace" && inputRef.current.value === "") {
      e.preventDefault();
      dispatch(deleteTask({ id, parentId, isSubtask, order }));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      dispatch(
        moveCursor({
          id: todo.id,
          parentId,
          isSubtask,
          order,
          text: textContent,
          orderDelta: -1,
        }),
      );
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      dispatch(
        moveCursor({
          id: todo.id,
          parentId,
          isSubtask,
          order,
          text: textContent,
          orderDelta: 1,
        }),
      );
    }
  };

  const onTextChange = (e) => {
    setTextContent(e.target.value);
    dispatch(
      updateTaskText({
        id: todo.id,
        text: e.target.value,
        parentId,
        isSubtask,
      }),
    );
  };

  const handleTodoToggle = () => {
    dispatch(
      toggleTaskState({
        id: todo.id,
        parentId,
        isSubtask,
      }),
    );
  };

  const handleTimeRangeChange = (startTime, endTime) => {
    dispatch(changeTaskTime({ id: todo.id, parentId, startTime, endTime }));
  };

  return (
    <div className={classNames("todo-item", { subtask: isSubtask })}>
      <div className="todo-item-task">
        {!isSubtask && !isCompleted && (
          <DatePicker
            startTime={startTime}
            endTime={endTime}
            onRangeChange={handleTimeRangeChange}
          />
        )}
        <Checkbox checked={isCompleted} onChange={handleTodoToggle} />
        <div className="todo-text-container">
          <input
            className="todo-text"
            ref={inputRef}
            id={id}
            onChange={onTextChange}
            onKeyDown={handleKeyDown}
            placeholder={isSubtask ? "Add new subtask" : "Add new task"}
            value={textContent}
          />
        </div>
      </div>
      {!isSubtask && subtasks.length > 0 && (
        <div className="subtasks">
          {todo.subtasks.map((subtask) => (
            <TodoItem
              key={subtask.id}
              todo={subtask}
              onTodoToggle={onTodoToggle}
              onTodoDelete={onTodoDelete}
              onTodoTextChange={onTodoTextChange}
              isFirstTask={subtask.order === 1}
              isLastTask={subtask.order === subtasks.length}
              isSubtask={parentId === null}
              showMessage={showMessage}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoItem;
