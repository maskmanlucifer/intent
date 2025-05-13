import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  clearCompletedTasks,
  selectCompletedTodoListWithoutFolder,
  deleteTask,
} from "../../redux/todoSlice";
import { Subtask, Task } from "../../types";
import { Collapse, Button, Popconfirm, Empty, message } from "antd";
import "./index.scss";
import { selectCategories } from "../../redux/categorySlice";
import TodoItem from "../todo-item";
import { DeleteOutlined } from "@ant-design/icons";

const CompletedTodoList = () => {
  const dispatch = useDispatch();
  const completedTodos = useSelector(selectCompletedTodoListWithoutFolder);
  const folders = useSelector(selectCategories);
  const [messageApi, contextHolder] = message.useMessage();

  const genExtra = (task: Task) => {
    return (
      <div className="todo-actions">
        <Popconfirm
          title="Are you sure you want to delete this task?"
          okText="Yes, delete"
          onConfirm={() => {
            dispatch(deleteTask({ id: task.id }));
            messageApi.open({
              type: "success",
              content: `Task ${task.text} deleted successfully!`,
            });
          }}
        >
          <DeleteOutlined className="delete-icon" />
        </Popconfirm>
      </div>
    );
  };

  const groupedTodos = completedTodos.reduce(
    (acc: { [key: string]: Task[] }, todo) => {
      const folderName = todo.categoryId;
      if (!acc[folderName]) {
        acc[folderName] = [];
      }
      acc[folderName].push(todo);
      return acc;
    },
    {},
  );

  const folderIdToName = folders.reduce(
    (acc: { [key: string]: string }, folder) => {
      acc[folder.id] = folder.name;
      return acc;
    },
    {},
  );

  const handleDeleteAll = async () => {
    dispatch(clearCompletedTasks());
    const confetti = (await import("canvas-confetti")).default;
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5, x: 0.52 },
    });
    messageApi.open({
      type: "success",
      content: "All completed todos deleted!",
    });
  };

  return (
    <div className="completed-todo-list">
      {contextHolder}
      {completedTodos.length > 0 && (
        <div className="completed-todo-items-groups">
          {completedTodos.length > 0 && (
            <Popconfirm
              title="Are you sure you want to delete all completed todos?"
              okText="Yes, delete"
              onConfirm={handleDeleteAll}
            >
              <Button type="primary" size="small" className="delete-all-button">
                Delete All Completed Todos
              </Button>
            </Popconfirm>
          )}
          {completedTodos.length > 0 &&
            Object.keys(groupedTodos).map((folder) => {
              const todos = groupedTodos[folder];
              return (
                <div className="completed-todo-items-group" key={folder}>
                  <div className="completed-todo-items-group-header">
                    {folderIdToName[folder]}
                  </div>
                  <Collapse expandIconPosition={"start"}>
                    {todos.map((task, index) => (
                      <Collapse.Panel
                        header={<TodoItem todoItem={task} index={index} />}
                        key={`${task.id}-${folder}`}
                        collapsible="header"
                        extra={genExtra(task)}
                      >
                        <div className="subtasks">
                          {task.subtasks.map(
                            (subtask: Subtask, index: number) => (
                              <TodoItem
                                todoItem={subtask}
                                key={`${subtask.id}-${folder}`}
                                index={index}
                              />
                            ),
                          )}
                        </div>
                      </Collapse.Panel>
                    ))}
                  </Collapse>
                </div>
              );
            })}
        </div>
      )}
      {completedTodos.length === 0 && (
        <div className="no-completed-todos">
          <Empty
            description="No completed todos available"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      )}
    </div>
  );
};

export default CompletedTodoList;
