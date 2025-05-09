import { DeleteOutlined, PlusOutlined, SwapOutlined } from "@ant-design/icons";
import { Button, Collapse, Dropdown, Menu, message, Popconfirm, Tooltip } from "antd";
import "./index.scss";
import TodoItem from "../todo-item";
import classNames from "classnames";
import { Subtask, Task } from "../../types";
import {
  addNewSubtask,
  addNewTask,
  changeCategoryOfTask,
  deleteTask,
} from "../../redux/todoSlice";
import { useDispatch, useSelector } from "react-redux";
import { ReactComponent as FocusIcon } from "../../assets/icons/focus.svg";
import { ReactComponent as FolderIcon } from "../../assets/icons/folder.svg";
import { RootState } from "../../redux/store";
import { updateCategory } from "../../redux/categorySlice";
import { selectFocusedTaskId, syncSettings } from "../../redux/sessionSlice";

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

  const doesFocusedTaskExist = todos.some(
    (todo) => todo.id === focusedTaskId
  );

  if (focusedTaskId && !doesFocusedTaskExist) {
    syncSettings({
      focusedTaskId: null
    })
  }

  const genExtra = (task: Task) => {
    const isFocused = focusedTaskId === task.id;
    const filteredFolders = folders.filter(
      (folder) => folder.id !== task.categoryId
    );

    return (
      <div className="todo-actions">
        <Tooltip arrow={false} title="Focus on task" mouseEnterDelay={0}>
          <FocusIcon
            className={classNames("focus-icon", {
              focused: isFocused,
            })}
            onClick={() => {
              if (isFocused) {
                syncSettings({
                  focusedTaskId: null
                })
                messageApi.open({
                  type: "success",
                  content: `Task ${task.text} unfocused!`,
                });
              } else {
                syncSettings({
                  focusedTaskId: task.id
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
          >
            <Dropdown
              overlay={
                <Menu
                  onClick={({ key }) => {
                    if (key === "none") {
                      return;
                    }
                    dispatch(
                      changeCategoryOfTask({ id: task.id, categoryId: key })
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
        <Popconfirm
          title="Are you sure you want to delete this task?"
          okText="Yes, delete"
            onConfirm={() => {
            dispatch(deleteTask({ id: task.id }));
            syncSettings({
              focusedTaskId: null
            });
            messageApi.open({
              type: "success",
              content: `Task ${task.text} deleted successfully!`,
            });
          }}
        >
          <DeleteOutlined className='delete-icon' />
        </Popconfirm>
      </div>
    );
  };

  const handleAddSubtask = (id: string, index: number) => {
    dispatch(addNewSubtask({ parentId: id, index }));
  };

  const handleToggleCompletedTasks = () => {
    dispatch(
      updateCategory({
        id: selectedFolder,
        showCompletedTasks: !currentFolder?.showCompletedTasks,
      })
    );
  };

  const currentFolder = folders.find((folder) => folder.id === selectedFolder);

  const finalTodos = focusedTaskId
    ? todos.filter((todo) => todo.id === focusedTaskId)
    : !currentFolder?.showCompletedTasks
      ? todos.filter((todo) => !todo.isCompleted)
      : todos;

  const sortedTodos = [
    ...finalTodos
      .map((todo) => ({
        ...todo,
        subtasks: [
          ...todo.subtasks.filter((subtask) => !subtask.isCompleted),
          ...todo.subtasks.filter((subtask) => subtask.isCompleted),
        ],
      }))
      .filter((todo) => !todo.isCompleted),
    ...finalTodos
      .map((todo) => ({
        ...todo,
        subtasks: [
          ...todo.subtasks.filter((subtask) => !subtask.isCompleted),
          ...todo.subtasks.filter((subtask) => subtask.isCompleted),
        ],
      }))
      .filter((todo) => todo.isCompleted),
  ];

  const doWeHaveCompletedTasks = todos.some((todo) => todo.isCompleted);

  return (
    <div className="todo-list">
      {focusedTaskId !== null && (
        <div className="focus-mode">
          Focus mode is enabled
        </div>
        )}
      {contextHolder}
      {focusedTaskId === null && doWeHaveCompletedTasks && (
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
      {sortedTodos.length > 0 && (
        <Collapse expandIconPosition={"start"}>
          {sortedTodos.map((task, index) => (
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
      {focusedTaskId === null && todos.length > 0 && (
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
