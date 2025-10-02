/* eslint-disable no-useless-concat */
import { DeleteOutlined, PlusOutlined, SwapOutlined } from "@ant-design/icons";
import {
  Button,
  Collapse,
  Dropdown,
  Menu,
  message,
  Popconfirm,
  Tooltip,
} from "antd";
import "./index.scss";
import TodoItem from "../todo-item";
import classNames from "classnames";
import { Subtask, Task } from "../../types";
import {
  addNewSubtask,
  addNewTask,
  changeCategoryOfTask,
  deleteAllCompletedCategoryTasks,
  deleteTask,
} from "../../redux/todoSlice";
import { useDispatch, useSelector } from "react-redux";
import { ReactComponent as FocusIcon } from "../../assets/icons/focus.svg";
import { ReactComponent as FolderIcon } from "../../assets/icons/folder.svg";
import { RootState } from "../../redux/store";
import { updateCategory } from "../../redux/categorySlice";
import { selectFocusedTaskId, syncSettings } from "../../redux/sessionSlice";
import useDnd from "../../hooks/useDnd";
import { ReactComponent as DragIcon } from "../../assets/icons/drag-icon.svg";
import { KEYBOARD_SHORTCUTS } from "../../constant";

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
  const focusedTaskId = useSelector(selectFocusedTaskId);
  const doesFocusedTaskExist = todos.some((todo) => todo.id === focusedTaskId);

  if (focusedTaskId && !doesFocusedTaskExist) {
    syncSettings({
      focusedTaskId: null,
    });
  }

  const genExtra = (task: Task) => {
    const isFocused = focusedTaskId === task.id;
    const filteredFolders = folders.filter(
      (folder) => folder.id !== task.categoryId,
    );

    return (
      <div className="todo-actions">
        <Tooltip
          arrow={false}
          title="Add subtask"
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
        >
          <PlusOutlined
            className="add-subtask-icon"
            onClick={(e) => {
              e.stopPropagation();
              dispatch(
                addNewSubtask({
                  parentId: task.id,
                  index: task.subtasks.length,
                  categoryId: task.categoryId,
                }),
              );
            }}
          />
        </Tooltip>
        <Tooltip
          arrow={false}
          title="Focus task"
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
        >
          <FocusIcon
            className={classNames("focus-icon", {
              focused: isFocused,
            })}
            onClick={(e) => {
              e.stopPropagation();
              if (isFocused) {
                syncSettings({
                  focusedTaskId: null,
                });
                messageApi.open({
                  type: "success",
                  content: `Task ${task.text} unfocused!`,
                });
              } else {
                syncSettings({
                  focusedTaskId: task.id,
                });
                messageApi.open({
                  type: "success",
                  content: `Task ${task.text} focused!`,
                });
              }
            }}
          />
        </Tooltip>
        {filteredFolders.length > 0 && (
          <Tooltip
            arrow={false}
            title="Move item to folder"
            mouseEnterDelay={0}
            mouseLeaveDelay={0}
          >
            <Dropdown
              overlay={
                <Menu
                  onClick={({ key, domEvent }) => {
                    domEvent.stopPropagation();
                    if (key === "none") {
                      return;
                    }
                    dispatch(
                      changeCategoryOfTask({
                        id: task.id,
                        sourceCategoryId: task.categoryId,
                        destinationCategoryId: key,
                      }),
                    );
                  }}
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
          </Tooltip>
        )}
        <Tooltip
          arrow={false}
          title="Delete task"
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
        >
          <Popconfirm
            title="Are you sure you want to delete this task?"
            okText="Yes, delete"
            onConfirm={(e) => {
              e?.stopPropagation();
              dispatch(
                deleteTask({ id: task.id, categoryId: task.categoryId }),
              );
              syncSettings({
                focusedTaskId: null,
              });
              messageApi.open({
                type: "success",
                content: `Task ${task.text} deleted successfully!`,
              });
            }}
          >
            <DeleteOutlined className="delete-icon" />
          </Popconfirm>
        </Tooltip>
      </div>
    );
  };

  const handleToggleCompletedTasks = () => {
    dispatch(
      updateCategory({
        id: selectedFolder,
        showCompletedTasks: !currentFolder?.showCompletedTasks,
      }),
    );
  };

  const currentFolder = folders.find((folder) => folder.id === selectedFolder);

  const finalTodos = focusedTaskId
    ? todos.filter((todo) => todo.id === focusedTaskId)
    : currentFolder && !currentFolder.showCompletedTasks
      ? todos.filter((todo) => !todo.isCompleted)
      : todos;

  const { isDragging } = useDnd(selectedFolder, finalTodos);

  const nonCompletedTodos = todos.filter((todo) => !todo.isCompleted);
  const doWeHaveCompletedTasks = todos.length > nonCompletedTodos.length;

  return (
    <div className="todo-list">
      {focusedTaskId === null && (
        <div className="todo-list-header">
          <div className="todo-list-header-left">{currentFolder?.name}</div>
          <div className="todo-list-header-right">
            {todos.length - nonCompletedTodos.length}/{todos.length}
          </div>
        </div>
      )}
      {focusedTaskId !== null && (
        <div className="focus-mode">
          <div className="focus-mode-header">Focus mode is enabled</div>
          <Button
            className="disable-focus-mode-button"
            onClick={() =>
              syncSettings({
                focusedTaskId: null,
              })
            }
            size="small"
            type="text"
          >
            Exit focus mode
          </Button>
        </div>
      )}
      {contextHolder}
      {focusedTaskId === null && doWeHaveCompletedTasks && (
        <div className="completed-tasks-toggle-container">
          {currentFolder?.showCompletedTasks && (
            <Popconfirm
              title="Are you sure you want to delete all completed todos?"
              okText="Yes, delete"
              onConfirm={async () => {
                dispatch(
                  deleteAllCompletedCategoryTasks({
                    categoryId: selectedFolder,
                  }),
                );
                const confetti = (await import("canvas-confetti")).default;
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.3, x: 0.52 },
                });
                messageApi.open({
                  type: "success",
                  content: `All completed todos deleted successfully!`,
                });
              }}
            >
              <Button type="primary" size="small" className="delete-all-button">
                Delete All Completed Todos
              </Button>
            </Popconfirm>
          )}
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
        </div>
      )}{" "}
      {finalTodos.length > 0 && (
        <Collapse
          activeKey={
            focusedTaskId &&
            finalTodos.filter((task) => task.id === focusedTaskId)[0].subtasks
              .length > 0
              ? [focusedTaskId + "-" + selectedFolder]
              : finalTodos
                  .filter((task) => task.subtasks.length > 0)
                  .map((task) => `${task.id}-${selectedFolder}`)
          }
          expandIconPosition={"start"}
          className={classNames("todo-list-collapse", {
            dragging: isDragging,
          })}
        >
          {finalTodos.map((task, index) => (
            <Collapse.Panel
              header={
                <div className="drag-handle-content">
                  <DragIcon
                    className={classNames("drag-icon", {
                      "no-subtasks": task.subtasks.length === 0,
                    })}
                  />
                  <TodoItem
                    todoItem={task}
                    index={index}
                    key={`${task.id}-${selectedFolder}-${task.subtasks.length}`}
                  />
                </div>
              }
              key={`${task.id}-${selectedFolder}`}
              extra={genExtra(task)}
              collapsible="header"
              data-allow-drop={true}
              className="drag-handle"
              showArrow={false}
            >
              {task.subtasks.length > 0 && (
                <div className="subtasks">
                  {task.subtasks.map((subtask: Subtask, index: number) => (
                    <TodoItem
                      todoItem={subtask}
                      key={`${subtask.id}-${selectedFolder}`}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </Collapse.Panel>
          ))}
        </Collapse>
      )}
      {focusedTaskId === null && todos.length > 0 && (
        <Tooltip
          arrow={false}
          title={"Add new task" + " (" + KEYBOARD_SHORTCUTS.addTask.key + ")"}
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
          placement={finalTodos.length === 0 ? "top" : "right"}
        >
          <Button
            type="primary"
            onClick={() =>
              dispatch(
                addNewTask({
                  categoryId: selectedFolder,
                  order: nonCompletedTodos.length,
                }),
              )
            }
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
