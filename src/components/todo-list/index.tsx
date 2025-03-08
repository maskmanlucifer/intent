import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  PlusOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import {
  Button,
  Collapse,
  Dropdown,
  Menu,
  message,
  Tooltip,
} from "antd";
import "./index.scss";
import TodoItem from "../todo-item";
import classNames from "classnames";
import { Subtask, Task } from "../../types";
import {
  addNewSubtask,
  moveTaskDown,
  moveTaskUp,
  addNewTask,
  changeCategoryOfTask,
} from "../../redux/todoSlice";
import { useDispatch, useSelector } from "react-redux";
import { ReactComponent as FocusIcon } from "../../assets/icons/focus.svg";
import { ReactComponent as FolderIcon } from "../../assets/icons/folder.svg";
import { RootState } from "../../redux/store";
import { useState } from "react";
import { updateCategory } from "../../redux/categorySlice";
const TodoList = ({
  selectedFolder,
  todos,
}: {
  selectedFolder: string;
  todos: Task[];
}) => {
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  const folders = useSelector((state: RootState) => state.categories.items);
  const [focusedTask, setFocusedTask] = useState<Task | null>(null);

  const genExtra = (task: Task) => {
    const isFirstTask = task.order === 1;
    const isLastTask = task.order === todos.length;
    const isFocused = focusedTask?.id === task.id;
    const filteredFolders = folders.filter((folder) => folder.id !== task.categoryId);

    return (
      <div className="todo-actions">
        {!isFirstTask && (
          <Tooltip arrow={false} title="Move task up" mouseEnterDelay={0}>
            <ArrowUpOutlined
              onClick={() =>
                dispatch(moveTaskUp({ id: task.id, order: task.order }))
              }
            />
          </Tooltip>
        )}
        {!isLastTask && (
          <Tooltip arrow={false} title="Move task down" mouseEnterDelay={0}>
            <ArrowDownOutlined
              onClick={() =>
                dispatch(moveTaskDown({ id: task.id, order: task.order }))
              }
            />
          </Tooltip>
        )}
        <Tooltip arrow={false} title="Focus on task" mouseEnterDelay={0}>
          <FocusIcon
            className={classNames("focus-icon", {
              focused: isFocused,
            })}
            onClick={() => {
              if (isFocused) {
                setFocusedTask(null);
                messageApi.open({
                  type: "success",
                  content: `Task ${task.text} unfocused!`,
                });
              } else {
                setFocusedTask(task);
                messageApi.open({
                  type: "success",
                  content: `Task ${task.text} focused!`,
                });
              }
            }}
          />
        </Tooltip>
        {filteredFolders.length > 0 && <Tooltip arrow={false} title="Move item to folder" mouseEnterDelay={0}>
          <Dropdown
            overlay={
              <Menu
                onClick={({ key }) =>
                  dispatch(
                    changeCategoryOfTask({ id: task.id, categoryId: key })
                  )
                }
              >
                <Menu.Item key="none" className="folder-move-item-to">
                  Move item to folder
                </Menu.Item>
                {filteredFolders.map((folder) => (
                    <Menu.Item key={folder.id} className="folder-move-item">
                      <FolderIcon />
                      {folder.name}
                    </Menu.Item>
                  ))}
              </Menu>
            }
            trigger={["click"]}
          >
            <SwapOutlined />
          </Dropdown>
        </Tooltip>}
      </div>
    );
  };

  const handleAddSubtask = (id: string, index: number) => {
    dispatch(addNewSubtask({ parentId: id, index }));
  };

  const handleToggleCompletedTasks = () => {
    dispatch(updateCategory({ id: selectedFolder, showCompletedTasks: !currentFolder?.showCompletedTasks }))
  };

  const currentFolder = folders.find((folder) => folder.id === selectedFolder);

  const finalTodos = focusedTask
    ? [focusedTask]
    : !currentFolder?.showCompletedTasks
      ? todos.filter((todo) => !todo.isCompleted)
      : todos;

  return (
    <div className="todo-list">
      {contextHolder}
      {focusedTask === null && (
        <Button
          className="completed-tasks-toggle"
          onClick={handleToggleCompletedTasks}
          size="small"
          type="text"
        >
          {!currentFolder?.showCompletedTasks
            ? "Show completed tasks"
            : "Hide completed tasks"}
        </Button>
      )}{" "}
      {finalTodos.length > 0 && (
        <Collapse expandIconPosition={"end"}>
          {finalTodos.map((task, index) => (
            <Collapse.Panel
              header={<TodoItem todoItem={task} index={index} />}
              key={`${task.id}-${selectedFolder}`}
              extra={genExtra(task)}
              collapsible="header"
            >
              <div className="subtasks">
                {task.subtasks.map((subtask: Subtask, index: number) => (
                  <TodoItem
                    todoItem={subtask}
                    key={`${subtask.id}-${selectedFolder}`}
                    index={index}
                  />
                ))}
                <Button
                  type="primary"
                  onClick={() =>
                    handleAddSubtask(task.id, task.subtasks.length)
                  }
                  className={classNames("add-subtask-button", {
                    haveSubtasks: task.subtasks.length > 0,
                  })}
                  icon={<PlusOutlined />}
                  size="small"
                >
                  {task.subtasks.length > 0 ? "" : "Add new subtask"}
                </Button>
              </div>
            </Collapse.Panel>
          ))}
        </Collapse>
      )}
      {focusedTask === null && todos.length > 0 && (
        <Tooltip arrow={false} title="Add new task" mouseEnterDelay={0}>
          <Button
            type="primary"
            onClick={() => dispatch(addNewTask({ categoryId: selectedFolder }))}
            className={classNames("add-task-button", {
              "empty-folder": finalTodos.length === 0,
            })}
            icon={<PlusOutlined />}
            size="small"
          >
            {finalTodos.length === 0 ? "Add new task" : ""}
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

export default TodoList;
