/* eslint-disable no-undef */
import { useEffect, useState } from "react";
import { KEYBOARD_SHORTCUTS, PAGES } from "./constant";
import "./App.scss";
import { ConfigProvider, Drawer } from "antd";
import "./db";
import Todo from "./pages/todo";
import { useSelector } from "react-redux";
import {
  selectActivePage,
  selectIsSidebarCollapsed,
  syncSettings,
} from "./redux/sessionSlice";
import Topbar from "./components/topbar";
import Linkboard from "./components/linkboard";
import SmoothSidebar from "./components/smooth-sidebar";
import Mousetrap from "mousetrap";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

const AppContent = () => {
  const activePage = useSelector(selectActivePage);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLinkBoardOpen, setIsLinkBoardOpen] = useState(false);
  const isSidebarCollapsed = useSelector(selectIsSidebarCollapsed);
  const { theme } = useTheme();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      handleSidebarCollapsed(!isSidebarCollapsed);
    };

    Mousetrap.bind(KEYBOARD_SHORTCUTS.toggleSidebar.binding, handler);

    return () => {
      Mousetrap.unbind(KEYBOARD_SHORTCUTS.toggleSidebar.binding);
    };
  }, [isSidebarCollapsed]);

  const handleSidebarCollapsed = (isCollapsed: boolean) => {
    syncSettings({
      sidebarCollapsed: isCollapsed,
    });
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? require('antd').theme.darkAlgorithm : require('antd').theme.defaultAlgorithm,
        token: {
          controlHeight: 32,
          fontFamily: "Inter",
          colorPrimary: theme === 'dark' ? "#3b82f6" : "#155dfc",
          colorBgContainer: theme === 'dark' ? "#111111" : "#ffffff",
          colorBgElevated: theme === 'dark' ? "#1a1a1a" : "#ffffff",
          colorBgLayout: theme === 'dark' ? "#0a0a0a" : "#f5f5f5",
          colorBorder: theme === 'dark' ? "#27272a" : "#d9d9d9",
          colorText: theme === 'dark' ? "#f8fafc" : "#1a1a1a",
          colorTextSecondary: theme === 'dark' ? "#cbd5e1" : "#666666",
          colorTextTertiary: theme === 'dark' ? "#94a3b8" : "#999999",
        },
        components: {
          Select: {
            optionPadding: "0px 12px 0px 12px",
            optionHeight: 24,
          },
          Modal: {
            contentBg: theme === 'dark' ? "#111111" : "#ffffff",
            headerBg: theme === 'dark' ? "#111111" : "#ffffff",
          },
          Drawer: {
            colorBgElevated: theme === 'dark' ? "#111111" : "#ffffff",
          },
        },
      }}
    >
        <div className="App">
        <Topbar
          isSidebarCollapsed={isSidebarCollapsed}
          setSidebarCollapsed={handleSidebarCollapsed}
          setIsDrawerOpen={setIsDrawerOpen}
          isDrawerOpen={isDrawerOpen}
          showCollapsedIcon={activePage === PAGES.TODO}
          setIsLinkBoardOpen={setIsLinkBoardOpen}
          isLinkBoardOpen={isLinkBoardOpen}
        />
        <Todo
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={handleSidebarCollapsed}
        />
        <SmoothSidebar
          isOpen={isLinkBoardOpen}
          onClose={() => setIsLinkBoardOpen(false)}
          title="LINKBOARD"
        >
          <Linkboard />
        </SmoothSidebar>
        </div>
    </ConfigProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
