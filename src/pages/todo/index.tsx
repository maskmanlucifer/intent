/* eslint-disable no-useless-concat */
import React, { useEffect } from "react";
import Mousetrap from "mousetrap";
import { Button, Empty, Layout, Tooltip } from "antd";
import "./index.scss";
import { ReactComponent as EmptyTodo } from "../../assets/images/empty-todo.svg";
import Sidebar from "../../components/sidebar";
import TodoList from "../../components/todo-list";
import { RootState } from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { selectCategories } from "../../redux/categorySlice";
import { addNewTask, selectTodoList } from "../../redux/todoSlice";
import CompletedTodoList from "../../components/completed-todo-list";
import { selectSettings, syncSettings } from "../../redux/sessionSlice";
import { KEYBOARD_SHORTCUTS } from "../../constant";
const { Sider } = Layout;

const siderStyle: React.CSSProperties = {
  overflow: "auto",
  height: "100%",
  position: "sticky",
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: "thin",
  scrollbarGutter: "stable",
  width: "300px",
};

const Todo = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}: {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (isSidebarCollapsed: boolean) => void;
}) => {
  const folders = useSelector(selectCategories);
  const settings = useSelector(selectSettings);
  const { selectedFolder } = settings;
  const todos = useSelector((state: RootState) =>
    selectTodoList(state, selectedFolder),
  );

  const handleFolderChange = (folderId: string) => {
    syncSettings({
      selectedFolder: folderId,
    });
  };

  const nonCompletedTodosLength = todos.filter(
    (todo) => !todo.isCompleted,
  ).length;

  const dispatch = useDispatch();

  const handleAddTask = () => {
    dispatch(
      addNewTask({
        categoryId: selectedFolder,
        order: nonCompletedTodosLength,
      }),
    );
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      handleAddTask();
    };

    Mousetrap.bind(KEYBOARD_SHORTCUTS.addTask.binding, handler);

    return () => {
      Mousetrap.unbind(KEYBOARD_SHORTCUTS.addTask.binding);
    };
  }, []);

  return (
    <div className="todo-page">
      <Layout hasSider>
        <Sider
          width={260}
          style={siderStyle}
          trigger={null}
          collapsible
          collapsed={isSidebarCollapsed}
        >
          <Sidebar
            folders={folders}
            selectedFolder={selectedFolder}
            setSelectedFolder={handleFolderChange}
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
          />
        </Sider>
        <div className="todo-items">
          {todos.length === 0 && selectedFolder !== "completed" && (
            <div className="empty-todo">
              <Empty
                image={<EmptyTodo />}
                description={<span>All clear, Take a breather. 🍃</span>}
              >
                <Tooltip
                  arrow={false}
                  title={
                    "Add new task" + " (" + KEYBOARD_SHORTCUTS.addTask.key + ")"
                  }
                  mouseEnterDelay={0}
                  mouseLeaveDelay={0}
                  placement="bottom"
                >
                  <Button type="primary" size="small" onClick={handleAddTask}>
                    Add new task
                  </Button>
                </Tooltip>
              </Empty>
            </div>
          )}
          {todos.length > 0 && selectedFolder !== "completed" && (
            <TodoList
              selectedFolder={selectedFolder}
              todos={todos}
              key={selectedFolder}
            />
          )}
          {selectedFolder === "completed" && <CompletedTodoList />}
        </div>
      </Layout>
    </div>
  );
};

export default Todo;
